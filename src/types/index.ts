import type { ChatInputCommandInteraction, ClientEvents, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { BotClient } from "~/client";

export type SlashCommandData =
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

export interface SlashCommand {
    data: SlashCommandData;
    execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

export interface EventModule<K extends keyof ClientEvents = keyof ClientEvents> {
    name: K;
    once?: boolean;
    execute: (...args: [...ClientEvents[K], BotClient]) => Promise<void> | void;
}

export type XPType = "text" | "voice";

export interface AwardXPBaseOptions {
    client: BotClient;
    guildId: string;
    userId: string;
    channelId?: string;
}

export interface AwardXPTextOptions extends AwardXPBaseOptions {
    type: "text";
}

export interface AwardXPVoiceOptions extends AwardXPBaseOptions {
    type: "voice";
    duration: number;
}

export type AwardXPOptions = AwardXPTextOptions | AwardXPVoiceOptions;
