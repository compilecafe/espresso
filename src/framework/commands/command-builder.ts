import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import type { CommandDefinition, CommandHandler, CommandOption, Guard, OptionType } from "../types";

export class SubcommandBuilder {
    name: string;
    description: string;
    options: CommandOption[] = [];
    handler: CommandHandler = async () => {};

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    private addOption(name: string, type: OptionType, description: string, required: boolean): this {
        this.options.push({ name, type, description, required });
        return this;
    }

    string(name: string, description: string, required = false): this {
        return this.addOption(name, "string", description, required);
    }

    user(name: string, description: string, required = false): this {
        return this.addOption(name, "user", description, required);
    }

    number(name: string, description: string, required = false): this {
        return this.addOption(name, "number", description, required);
    }

    integer(name: string, description: string, required = false): this {
        return this.addOption(name, "integer", description, required);
    }

    boolean(name: string, description: string, required = false): this {
        return this.addOption(name, "boolean", description, required);
    }

    role(name: string, description: string, required = false): this {
        return this.addOption(name, "role", description, required);
    }

    channel(name: string, description: string, required = false): this {
        return this.addOption(name, "channel", description, required);
    }

    mentionable(name: string, description: string, required = false): this {
        return this.addOption(name, "mentionable", description, required);
    }

    attachment(name: string, description: string, required = false): this {
        return this.addOption(name, "attachment", description, required);
    }

    execute(handler: CommandHandler): this {
        this.handler = handler;
        return this;
    }

    build(): SlashCommandSubcommandBuilder {
        const builder = new SlashCommandSubcommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        for (const opt of this.options) {
            this.applyOption(builder, opt);
        }

        return builder;
    }

    private applyOption(builder: SlashCommandSubcommandBuilder, opt: CommandOption): void {
        switch (opt.type) {
            case "string":
                builder.addStringOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "user":
                builder.addUserOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "number":
                builder.addNumberOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "integer":
                builder.addIntegerOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "boolean":
                builder.addBooleanOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "role":
                builder.addRoleOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "channel":
                builder.addChannelOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "mentionable":
                builder.addMentionableOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "attachment":
                builder.addAttachmentOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
        }
    }
}

export class CommandBuilder implements CommandDefinition {
    name: string;
    description: string;
    options: CommandOption[] = [];
    guards: Guard[] = [];
    handler: CommandHandler = async () => {};
    subcommands: Map<string, SubcommandBuilder> = new Map();

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    private addOption(name: string, type: OptionType, description: string, required: boolean): this {
        this.options.push({ name, type, description, required });
        return this;
    }

    string(name: string, description: string, required = false): this {
        return this.addOption(name, "string", description, required);
    }

    user(name: string, description: string, required = false): this {
        return this.addOption(name, "user", description, required);
    }

    number(name: string, description: string, required = false): this {
        return this.addOption(name, "number", description, required);
    }

    integer(name: string, description: string, required = false): this {
        return this.addOption(name, "integer", description, required);
    }

    boolean(name: string, description: string, required = false): this {
        return this.addOption(name, "boolean", description, required);
    }

    role(name: string, description: string, required = false): this {
        return this.addOption(name, "role", description, required);
    }

    channel(name: string, description: string, required = false): this {
        return this.addOption(name, "channel", description, required);
    }

    mentionable(name: string, description: string, required = false): this {
        return this.addOption(name, "mentionable", description, required);
    }

    attachment(name: string, description: string, required = false): this {
        return this.addOption(name, "attachment", description, required);
    }

    guard(...guards: Guard[]): this {
        this.guards.push(...guards);
        return this;
    }

    subcommand(name: string, description: string, configure: (sub: SubcommandBuilder) => SubcommandBuilder): this {
        const sub = new SubcommandBuilder(name, description);
        this.subcommands.set(name, configure(sub));
        return this;
    }

    execute(handler: CommandHandler): this {
        this.handler = handler;
        return this;
    }

    getHandler(subcommandName?: string): CommandHandler {
        if (subcommandName && this.subcommands.has(subcommandName)) {
            return this.subcommands.get(subcommandName)!.handler;
        }
        return this.handler;
    }

    build(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        for (const sub of this.subcommands.values()) {
            builder.addSubcommand(sub.build());
        }

        for (const opt of this.options) {
            this.applyOption(builder, opt);
        }

        return builder;
    }

    private applyOption(builder: SlashCommandBuilder, opt: CommandOption): void {
        switch (opt.type) {
            case "string":
                builder.addStringOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "user":
                builder.addUserOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "number":
                builder.addNumberOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "integer":
                builder.addIntegerOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "boolean":
                builder.addBooleanOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "role":
                builder.addRoleOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "channel":
                builder.addChannelOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "mentionable":
                builder.addMentionableOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
            case "attachment":
                builder.addAttachmentOption((o) => o.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                break;
        }
    }
}

export function command(name: string, description: string): CommandBuilder {
    return new CommandBuilder(name, description);
}
