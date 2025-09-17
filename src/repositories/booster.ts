import { and, eq } from "drizzle-orm";
import { db } from "~/database";
import { boosterRolesTable, type InsertBoosterRole } from "~/database/schema";

export async function getUserBoosterRole(guildId: string, userId: string) {
    const [role] = await db
        .select()
        .from(boosterRolesTable)
        .where(and(eq(boosterRolesTable.guildId, guildId), eq(boosterRolesTable.userId, userId)));
    return role ?? null;
}

export async function setUserBoosterRole(boosterRole: Partial<InsertBoosterRole>, id: string) {
    return (
        (await db.update(boosterRolesTable).set(boosterRole).where(eq(boosterRolesTable.id, id)).returning())[0] ?? null
    );
}

export async function addUserBoosterRole(boosterRole: InsertBoosterRole) {
    return (await db.insert(boosterRolesTable).values(boosterRole).returning())[0] ?? null;
}

export async function removeUserBoosterRole(id: string) {
    return (await db.delete(boosterRolesTable).where(eq(boosterRolesTable.id, id)).returning())[0] ?? null;
}
