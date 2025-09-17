import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BotClient, type SlashCommand } from "~/client";

export const data = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!");

export async function execute(interaction: ChatInputCommandInteraction, _client: BotClient): Promise<void> {
    await interaction.reply("Pong!");
}

export const command: SlashCommand = { data, execute };
export default command;
