import { Events, MessageFlags, type Interaction } from "discord.js";
import type { BotClient } from "~/client";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction: Interaction, client: BotClient): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        const content = "There was an error executing this command!";

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content });
        } else if (interaction.isRepliable()) {
            await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        }
    }
}
