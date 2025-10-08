import { eq } from "drizzle-orm";
import { db } from "~/database";
import { guildSettingsTable, type SelectLevelingSetting } from "~/database/schema";

export async function initGuildSettings(guildId: string) {
    const exist = await getGuildSettings(guildId);
    if (!exist) {
        await db.insert(guildSettingsTable).values({ guildId });
    }
}

export async function getGuildSettings(guildId: string) {
    const [setting] = await db
        .select()
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.guildId, guildId))
        .limit(1);
    return setting ?? null;
}

export async function getLevelingConfig(guildId: string): Promise<SelectLevelingSetting | null> {
    const [setting] = await db
        .select({
            isLevelingNotificationActive: guildSettingsTable.isLevelingNotificationActive,
            levelingNotificationChannelId: guildSettingsTable.levelingNotificationChannelId,
            levelingNotificaitonTemplate: guildSettingsTable.levelingNotificaitonTemplate,
            levelingCooldownMs: guildSettingsTable.levelingCooldownMs,
            levelingMinXpText: guildSettingsTable.levelingMinXpText,
            levelingMaxXpText: guildSettingsTable.levelingMaxXpText,
            levelingMinXpVoice: guildSettingsTable.levelingMinXpVoice,
            levelingMaxXpVoice: guildSettingsTable.levelingMaxXpVoice,
        })
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.guildId, guildId));
    return setting ?? null;
}
