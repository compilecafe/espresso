import { EmbedBuilder } from "discord.js";
import { command, guildOnly } from "~/framework";
import { getUserLevel } from "~/repositories/leveling";
import { getXPForLevel } from "~/utils/level";

export default command("level", "Check your level and XP or someone else's")
    .user("user", "The user you want to check")
    .guard(guildOnly)
    .execute(async (ctx) => {
        await ctx.defer();

        const targetUser = ctx.getUser("user") ?? ctx.user;
        const userRow = await getUserLevel(ctx.guild!.id, targetUser.id);

        if (!userRow) {
            await ctx.reply({
                content: `${targetUser} hasn't earned any XP yet.`,
                allowedMentions: { users: [] },
            });
            return;
        }

        const embed = buildLevelEmbed(targetUser, userRow);
        await ctx.reply({ embeds: [embed] });
    });

function buildLevelEmbed(
    user: { username: string; displayAvatarURL: () => string },
    userRow: { level: number; textXp: number; voiceXp: number }
): EmbedBuilder {
    const { level, textXp, voiceXp } = userRow;
    const totalXP = textXp + voiceXp;
    const nextLevel = level + 1;

    const prevLevelXP = getXPForLevel(level);
    const nextLevelXP = getXPForLevel(nextLevel);
    const xpThisLevel = totalXP - prevLevelXP;
    const neededThisLevel = nextLevelXP - prevLevelXP;

    const progress = Math.max(0, Math.min(xpThisLevel / neededThisLevel, 1));
    const barLength = 14;
    const filledLength = Math.round(progress * barLength);
    const bar = "▰".repeat(filledLength) + "▱".repeat(barLength - filledLength);

    return new EmbedBuilder()
        .setColor("#FF6AD5")
        .setAuthor({ name: `${user.username}'s Profile`, iconURL: user.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`**Level ${level} → ${nextLevel}**`)
        .addFields(
            {
                name: "Progress",
                value: `${bar} \`${xpThisLevel.toLocaleString()} / ${neededThisLevel.toLocaleString()} XP (${Math.round(progress * 100)}%)\``,
                inline: false,
            },
            { name: "Text XP", value: textXp.toLocaleString(), inline: true },
            { name: "Voice XP", value: voiceXp.toLocaleString(), inline: true },
            { name: "Total XP", value: totalXP.toLocaleString(), inline: true }
        )
        .setFooter({ text: "Keep chatting and talking to level up!" });
}
