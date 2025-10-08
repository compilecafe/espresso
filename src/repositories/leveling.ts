import { and, eq } from "drizzle-orm";
import { db } from "~/database";
import {
    levelingRolesTable,
    levelingSpecialChannelsTable,
    levelingUserLevelsTable,
    levelingVoiceSessionsTable,
    type InsertLevelingUserLevel,
    type InsertLevelingVoiceSession,
    type SelectLevelingRole,
    type SelectLevelingSpecialChannel,
    type SelectLevelingUserLevel,
    type SelectLevelingVoiceSession,
} from "~/database/schema";

export async function setUserLevel(
    userLevel: Omit<Partial<InsertLevelingUserLevel>, "id">,
    id: string
): Promise<SelectLevelingUserLevel | null> {
    const [returning] = await db
        .update(levelingUserLevelsTable)
        .set(userLevel)
        .where(eq(levelingUserLevelsTable.id, id))
        .returning();
    return returning ?? null;
}

export async function addUserLevel(userLevel: InsertLevelingUserLevel): Promise<SelectLevelingUserLevel | null> {
    const [returning] = await db.insert(levelingUserLevelsTable).values(userLevel).returning();
    return returning ?? null;
}

export async function getUserLevel(guildId: string, userId: string): Promise<SelectLevelingUserLevel | null> {
    const [level] = await db
        .select()
        .from(levelingUserLevelsTable)
        .where(and(eq(levelingUserLevelsTable.guildId, guildId), eq(levelingUserLevelsTable.userId, userId)));
    return level ?? null;
}

export async function addVoiceSession(
    voiceSession: InsertLevelingVoiceSession
): Promise<SelectLevelingVoiceSession | null> {
    const [returning] = await db.insert(levelingVoiceSessionsTable).values(voiceSession).returning();
    return returning ?? null;
}

export async function getVoiceSession(guildId: string, userId: string): Promise<SelectLevelingVoiceSession | null> {
    const [session] = await db
        .select()
        .from(levelingVoiceSessionsTable)
        .where(and(eq(levelingVoiceSessionsTable.guildId, guildId), eq(levelingVoiceSessionsTable.userId, userId)))
        .limit(1);
    return session ?? null;
}

export async function removeVoiceSession(sessionId: string): Promise<SelectLevelingVoiceSession | null> {
    const [returning] = await db
        .delete(levelingVoiceSessionsTable)
        .where(eq(levelingVoiceSessionsTable.id, sessionId))
        .returning();
    return returning ?? null;
}

export async function getSpecialLevelingChannels(guildId: string): Promise<SelectLevelingSpecialChannel[] | null> {
    const channels = await db
        .select()
        .from(levelingSpecialChannelsTable)
        .where(eq(levelingSpecialChannelsTable.guildId, guildId));
    return channels ?? null;
}

export async function getSpecialLevelingChannel(
    guildId: string,
    channelId: string
): Promise<SelectLevelingSpecialChannel | null> {
    const [channel] = await db
        .select()
        .from(levelingSpecialChannelsTable)
        .where(
            and(
                eq(levelingSpecialChannelsTable.guildId, guildId),
                eq(levelingSpecialChannelsTable.channelId, channelId)
            )
        );
    return channel ?? null;
}

export async function getRoleForLevel(guildId: string, level: number): Promise<SelectLevelingRole | null> {
    const [role] = await db
        .select()
        .from(levelingRolesTable)
        .where(and(eq(levelingRolesTable.guildId, guildId), eq(levelingRolesTable.level, level)));
    return role ?? null;
}
