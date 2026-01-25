import { Client, Collection, GatewayIntentBits, REST, Routes, MessageFlags } from "discord.js";
import { createContext } from "./context";
import { CommandError } from "./errors";
import { loadCommands, loadEvents } from "./loader";
import type { BaristaConfig, CommandDefinition } from "./types";

export interface Plugin {
    name: string;
    setup: (barista: Barista) => void | Promise<void>;
}

export class Barista {
    private client: Client;
    private commands = new Collection<string, CommandDefinition>();
    private config: BaristaConfig;
    private commandsDir: string = "";
    private eventsDir: string = "";
    private plugins: Plugin[] = [];
    private onReadyCallbacks: Array<(client: Client) => void | Promise<void>> = [];
    private onErrorCallbacks: Array<(error: Error, commandName: string) => void> = [];

    constructor(config: BaristaConfig) {
        this.config = config;
        this.client = new Client({ intents: config.intents });
    }

    static create(config: BaristaConfig): Barista {
        return new Barista(config);
    }

    static intents = {
        guilds: GatewayIntentBits.Guilds,
        messages: GatewayIntentBits.GuildMessages,
        members: GatewayIntentBits.GuildMembers,
        voice: GatewayIntentBits.GuildVoiceStates,
        messageContent: GatewayIntentBits.MessageContent,
    };

    withCommands(dir: string): this {
        this.commandsDir = dir;
        return this;
    }

    withEvents(dir: string): this {
        this.eventsDir = dir;
        return this;
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
        return this.commands;
    }

    async start(): Promise<void> {
        for (const plugin of this.plugins) {
            await plugin.setup(this);
            console.log(`☕ Plugin loaded: ${plugin.name}`);
        }

        await this.loadAllCommands();
        await this.loadAllEvents();
        this.setupInteractionHandler();

        this.client.once("ready", async () => {
            console.log(`☕ Barista is ready! Logged in as ${this.client.user?.tag}`);
            for (const callback of this.onReadyCallbacks) {
                await callback(this.client);
            }
        });

        await this.client.login(this.config.token);
    }

    private async loadAllCommands(): Promise<void> {
        if (!this.commandsDir) return;

        const commands = await loadCommands(this.commandsDir);
        const commandsJSON: unknown[] = [];

        for (const cmd of commands) {
            this.commands.set(cmd.name, cmd);
            commandsJSON.push(cmd.build().toJSON());
        }

        const rest = new REST({ version: "10" }).setToken(this.config.token);
        await rest.put(Routes.applicationCommands(this.config.clientId), { body: commandsJSON });

        console.log(`☕ Loaded ${commands.length} commands`);
    }

    private async loadAllEvents(): Promise<void> {
        if (!this.eventsDir) return;

        const events = await loadEvents(this.eventsDir);

        for (const evt of events) {
            if (evt.once) {
                this.client.once(evt.name, (...args) => evt.handler(...args, this.client));
            } else {
                this.client.on(evt.name, (...args) => evt.handler(...args, this.client));
            }
        }

        console.log(`☕ Loaded ${events.length} events`);
    }

    private setupInteractionHandler(): void {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            const ctx = createContext(interaction, this.client);
            const subcommandName = interaction.options.getSubcommand(false);

            try {
                for (const guard of command.guards) {
                    const result = await guard(ctx);
                    if (result !== true) {
                        const message = typeof result === "string" ? result : "You cannot use this command.";
                        await ctx.reply({ content: message, flags: MessageFlags.Ephemeral });
                        return;
                    }
                }

                const handler = command.getHandler(subcommandName ?? undefined);
                await handler(ctx);
            } catch (error) {
                for (const callback of this.onErrorCallbacks) {
                    callback(error as Error, command.name);
                }

                if (error instanceof CommandError) {
                    const flags = error.ephemeral ? MessageFlags.Ephemeral : undefined;
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ content: error.message });
                    } else {
                        await interaction.reply({ content: error.message, flags });
                    }
                    return;
                }

                console.error(`Error in command ${command.name}:`, error);
                const content = "An error occurred while executing this command.";

                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content });
                } else {
                    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
                }
            }
        });
    }
}
