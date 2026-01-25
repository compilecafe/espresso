import { eq } from "drizzle-orm";
import { db } from "~/config/database";
import { guildSettings, type GuildSetting } from "~/database/schema/schema";

export const GuildRepository = {
    async findOrCreate(guildId: string): Promise<GuildSetting> {
        const [existing] = await db.select().from(guildSettings).where(eq(guildSettings.guildId, guildId)).limit(1);
        
        if (existing) return existing;
        
        const [created] = await db.insert(guildSettings).values({ guildId }).returning();
        return created!;
    },

    async find(guildId: string): Promise<GuildSetting | null> {
        const [setting] = await db.select().from(guildSettings).where(eq(guildSettings.guildId, guildId)).limit(1);
        return setting ?? null;
    },

    async update(guildId: string, data: Partial<GuildSetting>): Promise<GuildSetting | null> {
        const [updated] = await db.update(guildSettings).set(data).where(eq(guildSettings.guildId, guildId)).returning();
        return updated ?? null;
    },
};
