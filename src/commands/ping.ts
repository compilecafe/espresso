import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "~/types";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply("Pong!");
}

export default { data, execute } satisfies SlashCommand;
