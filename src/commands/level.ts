import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { BotClient, type SlashCommand } from "../client";
import { getXPForLevel } from "~/utils/level";
import { getUserLevel } from "~/repositories/leveling";

export const data = new SlashCommandBuilder()
    .setName("level")
    .setDescription("Check your level and XP or someone else's")
    .addUserOption((option) => option.setName("user").setDescription("The user you want to check").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction, _: BotClient): Promise<void> {
    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    if (!interaction.guild) {
        await interaction.reply({ content: "Command ini hanya bisa digunakan di server.", ephemeral: true });
        return;
    }

    const userRow = await getUserLevel(interaction.guild.id, targetUser.id);

    if (!userRow) {
        await interaction.reply({
            content: `${targetUser} hasn’t earned any XP yet.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const currentLevel = userRow.level;
    const currentXP = userRow.xp;

    const nextLevel = currentLevel + 1;
    const xpForNextLevel = getXPForLevel(nextLevel);
    const xpToNextLevel = xpForNextLevel - currentXP;

    const embed = new EmbedBuilder()
        .setColor("#FF69B4")
        .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL() })
        .setTitle(`Level ${currentLevel}`)
        .addFields(
            { name: "Current XP", value: `${currentXP}`, inline: true },
            { name: "XP to Next Level", value: `${xpToNextLevel}`, inline: true },
            {
                name: "Progress",
                value: (() => {
                    const totalXP = currentXP + xpToNextLevel;
                    const progress = currentXP / totalXP;
                    const barLength = 20;
                    const filledLength = Math.round(progress * barLength);
                    const bar = "▰".repeat(filledLength) + "▱".repeat(barLength - filledLength);
                    return `${bar} \`${Math.round(progress * 100)}%\``;
                })(),
            }
        )
        .setThumbnail(
            "https://cdn.discordapp.com/attachments/1397376270735511572/1417748450610511972/cute-pink.gif?ex=68cb9ca3&is=68ca4b23&hm=a32c37351334205a9887be40ce1cf07751732f849e3f7dbe6b44ec290c082c6c&"
        )
        .setFooter({ text: `Next Level: ${nextLevel}` });

    await interaction.reply({ embeds: [embed] });
}

export const command: SlashCommand = { data, execute };
export default command;
