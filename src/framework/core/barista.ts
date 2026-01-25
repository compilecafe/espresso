import { Client, Collection, Events, GatewayIntentBits, REST, Routes, MessageFlags } from "discord.js";
import { createContext } from "../commands/context";
import { loadCommands, loadEvents } from "./loader";
import { logger } from "./logger";
import { CommandError } from "../support/errors";
import type { BaristaConfig, CommandDefinition } from "../types";

export interface Plugin {
    name: string;
    version?: string;
    setup: (barista: Barista) => void | Promise<void>;
}

export interface BaristaOptions extends BaristaConfig {
    commandsPath?: string;
    eventsPath?: string;
}

export class Barista {
    private client: Client;
    private commandsCollection = new Collection<string, CommandDefinition>();
    private config: BaristaOptions;
    private plugins: Plugin[] = [];
    private onReadyCallbacks: Array<(client: Client) => void | Promise<void>> = [];
    private onErrorCallbacks: Array<(error: Error, commandName: string) => void> = [];
    private booted = false;

    constructor(config: BaristaOptions) {
        this.config = config;
        this.client = new Client({ intents: config.intents });
    }

    static create(config: BaristaOptions): Barista {
        return new Barista(config);
    }

    static intents = {
        guilds: GatewayIntentBits.Guilds,
        messages: GatewayIntentBits.GuildMessages,
        members: GatewayIntentBits.GuildMembers,
        voice: GatewayIntentBits.GuildVoiceStates,
        messageContent: GatewayIntentBits.MessageContent,
        reactions: GatewayIntentBits.GuildMessageReactions,
        presences: GatewayIntentBits.GuildPresences,
        typing: GatewayIntentBits.GuildMessageTyping,
        directMessages: GatewayIntentBits.DirectMessages,
        all: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent,
        ],
    };

    commands(path: string): this {
        this.config.commandsPath = path;
        return this;
    }

    events(path: string): this {
        this.config.eventsPath = path;
        return this;
    }

    withCommands(path: string): this {
        return this.commands(path);
    }

    withEvents(path: string): this {
        return this.events(path);
    }

    onReady(callback: (client: Client) => void | Promise<void>): this {
        this.onReadyCallbacks.push(callback);
        return this;
    }

    onError(callback: (error: Error, commandName: string) => void): this {
        this.onErrorCallbacks.push(callback);
        return this;
    }

    use(plugin: Plugin): this {
        this.plugins.push(plugin);
        return this;
    }

    getClient(): Client {
        return this.client;
    }

    getCommands(): Collection<string, CommandDefinition> {
        return this.commandsCollection;
    }

    isDebug(): boolean {
        return this.config.debug ?? false;
    }

    async start(): Promise<void> {
        if (this.booted) {
            logger.warn("Barista is already running");
            return;
        }

        logger.box("Barista Framework", "☕ Starting Discord Bot...");

        for (const plugin of this.plugins) {
            await plugin.setup(this);
            logger.success(`Plugin loaded: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ""}`);
        }

        await this.loadAllCommands();
        await this.loadAllEvents();
        this.setupInteractionHandler();

        this.client.once(Events.ClientReady, async (readyClient) => {
            logger.ready(`Logged in as ${readyClient.user.tag}`);
            logger.info(`Serving ${readyClient.guilds.cache.size} guilds`);

            for (const callback of this.onReadyCallbacks) {
                await callback(this.client);
            }
        });

        await this.client.login(this.config.token);
        this.booted = true;
    }

    async stop(): Promise<void> {
        if (!this.booted) return;

        logger.info("Shutting down...");
        this.client.destroy();
        this.booted = false;
        logger.success("Goodbye! ☕");
    }

    private async loadAllCommands(): Promise<void> {
        if (!this.config.commandsPath) return;

        const commands = await loadCommands(this.config.commandsPath);

        for (const cmd of commands) {
            this.commandsCollection.set(cmd.name, cmd);
            if (this.isDebug()) {
                logger.command(cmd.name);
            }
        }

        const commandsJSON = commands.map((cmd) => cmd.build().toJSON());
        const rest = new REST({ version: "10" }).setToken(this.config.token);
        await rest.put(Routes.applicationCommands(this.config.clientId), { body: commandsJSON });

        logger.success(`Loaded ${commands.length} commands`);
    }

    private async loadAllEvents(): Promise<void> {
        if (!this.config.eventsPath) return;

        const events = await loadEvents(this.config.eventsPath);

        for (const evt of events) {
            if (evt.once) {
                this.client.once(evt.name, (...args) => evt.handler(...args, this.client));
            } else {
                this.client.on(evt.name, (...args) => evt.handler(...args, this.client));
            }

            if (this.isDebug()) {
                logger.event(evt.name);
            }
        }

        logger.success(`Loaded ${events.length} events`);
    }

    private setupInteractionHandler(): void {
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.replied || interaction.deferred) return;

            const command = this.commandsCollection.get(interaction.commandName);
            if (!command) return;

            const ctx = createContext(interaction, this.client);
            const subcommandName = interaction.options.getSubcommand(false);

            try {
                for (const guard of command.guards) {
                    const result = await guard(ctx);
                    if (result !== true) {
                        const message = typeof result === "string" ? result : "You cannot use this command.";
                        await ctx.error(message);
                        return;
                    }
                }

                const handler = command.getHandler(subcommandName ?? undefined);
                await handler(ctx);
            } catch (error) {
                this.handleCommandError(error as Error, command.name, interaction, ctx);
            }
        });
    }

    private async handleCommandError(
        error: Error,
        commandName: string,
        interaction: { deferred: boolean; replied: boolean; editReply: (opts: object) => Promise<unknown>; reply: (opts: object) => Promise<unknown> },
        ctx: { error: (msg: string) => Promise<void> }
    ): Promise<void> {
        for (const callback of this.onErrorCallbacks) {
            callback(error, commandName);
        }

        if (error instanceof CommandError) {
            await ctx.error(error.message);
            return;
        }

        logger.error(`Command "${commandName}" failed:`, error.message);
        if (this.isDebug()) {
            console.error(error);
        }

        const content = "An error occurred while executing this command.";
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content });
            } else {
                await interaction.reply({ content, flags: MessageFlags.Ephemeral });
            }
        } catch {
        }
    }
}
