import { eq } from "drizzle-orm";
import { db } from "~/database";
import { guildSettingsTable, type SelectAutoRoleSetting } from "~/database/schema";

export async function getAutoRoleConfig(guildId: string): Promise<SelectAutoRoleSetting | null> {
    const [setting] = await db
        .select({
            autoRoleBotRoleId: guildSettingsTable.autoRoleBotRoleId,
            autoRoleUserRoleId: guildSettingsTable.autoRoleUserRoleId,
        })
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.guildId, guildId));
    return setting ?? null;
}
