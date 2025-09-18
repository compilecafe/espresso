import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { BotClient, type SlashCommand } from "../client";
import { getXPForLevel } from "~/utils/level";
import { getUserLevel } from "~/repositories/leveling";

export const data = new SlashCommandBuilder()
    .setName("level")
    .setDescription("Check your level and XP or someone else's")
    .addUserOption((option) => option.setName("user").setDescription("The user you want to check").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction, _: BotClient): Promise<void> {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser("user") ?? interaction.user;

    if (!interaction.guild) {
        await interaction.editReply({
            content: "This command can only be used in a server",
        });
        return;
    }

    const userRow = await getUserLevel(interaction.guild.id, targetUser.id);

    if (!userRow) {
        await interaction.editReply({
            content: `${targetUser} hasn’t earned any XP yet.`,
            allowedMentions: { users: [] },
        });
        return;
    }

    const currentLevel = userRow.level;
    const textXp = userRow.textXp ?? 0;
    const voiceXp = userRow.voiceXp ?? 0;
    const totalXP = textXp + voiceXp;

    const nextLevel = currentLevel + 1;
    const xpForNextLevel = getXPForLevel(nextLevel);

    const embed = new EmbedBuilder()
        .setColor("#FF6AD5")
        .setAuthor({
            name: `${targetUser.username}'s Profile`,
            iconURL: targetUser.displayAvatarURL(),
        })
        .setThumbnail(targetUser.displayAvatarURL())
        .setDescription(`**Level ${currentLevel} → ${nextLevel}**`)
        .addFields(
            {
                name: "Progress",
                value: (() => {
                    const prevLevelXP = getXPForLevel(currentLevel);
                    const xpThisLevel = totalXP - prevLevelXP;
                    const neededThisLevel = xpForNextLevel - prevLevelXP;

                    const progress = xpThisLevel / neededThisLevel;
                    const barLength = 14;
                    const filledLength = Math.round(progress * barLength);
                    const bar = "▰".repeat(filledLength) + "▱".repeat(barLength - filledLength);

                    return `${bar} \`${xpThisLevel.toLocaleString()} / ${neededThisLevel.toLocaleString()} XP (${Math.round(
                        progress * 100
                    )}%)\``;
                })(),
                inline: false,
            },
            {
                name: "Text XP",
                value: `${textXp.toLocaleString()}`,
                inline: true,
            },
            {
                name: "Voice XP",
                value: `${voiceXp.toLocaleString()}`,
                inline: true,
            },
            {
                name: "Total XP",
                value: `${totalXP.toLocaleString()}`,
                inline: true,
            }
        )
        .setFooter({
            text: `Keep chatting and talking to level up!`,
        });

    await interaction.editReply({ embeds: [embed] });
}

export const command: SlashCommand = { data, execute };
export default command;
