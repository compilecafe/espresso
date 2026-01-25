import { command, guildOnly, EmbedBuilder } from "~/framework";
import { LevelingRepository } from "~/app/repositories/leveling-repository";
import { LevelingService } from "~/app/services/leveling-service";

export default command("level", "Check your level and XP")
    .user("user", "The user to check")
    .guard(guildOnly)
    .execute(async (ctx) => {
        await ctx.defer();

        const target = ctx.getUser("user") ?? ctx.user;
        const userLevel = await LevelingRepository.getUserLevel(ctx.guild!.id, target.id);

        if (!userLevel) {
            await ctx.info(`${target} hasn't earned any XP yet.`);
            return;
        }

        const { level, textXp, voiceXp } = userLevel;
        const totalXP = textXp + voiceXp;
        const nextLevel = level + 1;

        const prevLevelXP = LevelingService.getXPForLevel(level);
        const nextLevelXP = LevelingService.getXPForLevel(nextLevel);
        const xpThisLevel = totalXP - prevLevelXP;
        const neededThisLevel = nextLevelXP - prevLevelXP;

        const progress = Math.max(0, Math.min(xpThisLevel / neededThisLevel, 1));
        const barLength = 14;
        const filledLength = Math.round(progress * barLength);
        const bar = "▰".repeat(filledLength) + "▱".repeat(barLength - filledLength);

        const embed = new EmbedBuilder()
            .setColor("#FF6AD5")
            .setAuthor({ name: `${target.username}'s Profile`, iconURL: target.displayAvatarURL() })
            .setThumbnail(target.displayAvatarURL())
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

        await ctx.embed(embed);
    });
