import { and, eq } from "drizzle-orm";
import { db } from "~/config/database";
import { boosterRoles, guildSettings, type BoosterRole, type NewBoosterRole } from "~/database/schema/schema";

export const BoosterRepository = {
    async findByUser(guildId: string, userId: string): Promise<BoosterRole | null> {
        const [role] = await db.select().from(boosterRoles)
            .where(and(eq(boosterRoles.guildId, guildId), eq(boosterRoles.userId, userId)));
        return role ?? null;
    },

    async create(data: NewBoosterRole): Promise<BoosterRole> {
        const [role] = await db.insert(boosterRoles).values(data).returning();
        return role!;
    },

    async update(id: string, data: Partial<BoosterRole>): Promise<BoosterRole | null> {
        const [updated] = await db.update(boosterRoles).set(data).where(eq(boosterRoles.id, id)).returning();
        return updated ?? null;
    },

    async delete(id: string): Promise<void> {
        await db.delete(boosterRoles).where(eq(boosterRoles.id, id));
    },

    async getReferenceRole(guildId: string): Promise<string | null> {
        const [setting] = await db.select({ roleId: guildSettings.boosterReferenceRoleId })
            .from(guildSettings)
            .where(eq(guildSettings.guildId, guildId))
            .limit(1);
        return setting?.roleId ?? null;
    },
};
