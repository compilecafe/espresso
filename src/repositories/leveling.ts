import { and, eq } from "drizzle-orm";
import { db } from "~/database";
import {
    guildSettingsTable,
    levelingRolesTable,
    levelingSpecialChannelsTable,
    levelingUserLevelsTable,
    levelingVoiceSessionsTable,
    type InsertLevelingUserLevel,
    type InsertLevelingVoiceSession,
} from "~/database/schema";

export async function setUserLevel(userLevel: Omit<Partial<InsertLevelingUserLevel>, "id">, id: string) {
    return (
        (
            await db
                .update(levelingUserLevelsTable)
                .set(userLevel)
                .where(eq(levelingUserLevelsTable.id, id))
                .returning()
        )[0] ?? null
    );
}

export async function addUserLevel(userLevel: InsertLevelingUserLevel) {
    return (await db.insert(levelingUserLevelsTable).values(userLevel).returning())[0] ?? null;
}

export async function getUserLevel(guildId: string, userId: string) {
    const [level] = await db
        .select()
        .from(levelingUserLevelsTable)
        .where(and(eq(levelingUserLevelsTable.guildId, guildId), eq(levelingUserLevelsTable.userId, userId)));
    return level ?? null;
}

export async function addVoiceSession(voiceSession: InsertLevelingVoiceSession) {
    return (await db.insert(levelingVoiceSessionsTable).values(voiceSession).returning())[0] ?? null;
}

export async function getVoiceSession(guildId: string, userId: string) {
    const [session] = await db
        .select()
        .from(levelingVoiceSessionsTable)
        .where(and(eq(levelingVoiceSessionsTable.guildId, guildId), eq(levelingVoiceSessionsTable.userId, userId)))
        .limit(1);
    return session ?? null;
}

export async function removeVoiceSession(sessionId: string) {
    return (
        (
            await db.delete(levelingVoiceSessionsTable).where(eq(levelingVoiceSessionsTable.id, sessionId)).returning()
        )[0] ?? null
    );
}

export async function getLevelingConfig(guildId: string) {
    const [setting] = await db
        .select({
            levelUpNotifications: guildSettingsTable.levelUpNotifications,
            levelUpChannelId: guildSettingsTable.levelUpChannelId,
            levelUpMessageTemplate: guildSettingsTable.levelUpMessageTemplate,
        })
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.guildId, guildId));
    return setting ?? null;
}

export async function getSpecialLevelingChannels(guildId: string) {
    const channels = await db
        .select()
        .from(levelingSpecialChannelsTable)
        .where(eq(levelingSpecialChannelsTable.guildId, guildId));
    return channels ?? null;
}

export async function getSpecialLevelingChannel(guildId: string, channelId: string) {
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

export async function getLevelRole(guildId: string, level: number) {
    const [role] = await db
        .select()
        .from(levelingRolesTable)
        .where(and(eq(levelingRolesTable.guildId, guildId), eq(levelingRolesTable.level, level)));
    return role ?? null;
}
