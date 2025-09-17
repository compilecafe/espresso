import { eq } from "drizzle-orm";
import { db } from "~/database";
import { guildSettingsTable } from "~/database/schema";

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
