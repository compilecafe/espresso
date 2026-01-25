import { and, eq } from "drizzle-orm";
import { db } from "~/config/database";
import {
    userLevels,
    voiceSessions,
    levelRoles,
    specialChannels,
    guildSettings,
    type UserLevel,
    type NewUserLevel,
    type VoiceSession,
    type NewVoiceSession,
    type LevelRole,
    type SpecialChannel,
} from "~/database/schema/schema";

export const LevelingRepository = {
    async getUserLevel(guildId: string, userId: string): Promise<UserLevel | null> {
        const [level] = await db.select().from(userLevels)
            .where(and(eq(userLevels.guildId, guildId), eq(userLevels.userId, userId)));
        return level ?? null;
    },

    async upsertUserLevel(data: NewUserLevel): Promise<UserLevel> {
        const existing = await this.getUserLevel(data.guildId, data.userId);
        
        if (existing) {
            const [updated] = await db.update(userLevels)
                .set({ textXp: data.textXp, voiceXp: data.voiceXp, level: data.level })
                .where(eq(userLevels.id, existing.id))
                .returning();
            return updated!;
        }
        
        const [created] = await db.insert(userLevels).values(data).returning();
        return created!;
    },

    async getVoiceSession(guildId: string, userId: string): Promise<VoiceSession | null> {
        const [session] = await db.select().from(voiceSessions)
            .where(and(eq(voiceSessions.guildId, guildId), eq(voiceSessions.userId, userId)))
            .limit(1);
        return session ?? null;
    },

    async createVoiceSession(data: NewVoiceSession): Promise<VoiceSession> {
        const [session] = await db.insert(voiceSessions).values(data).returning();
        return session!;
    },

    async deleteVoiceSession(id: string): Promise<void> {
        await db.delete(voiceSessions).where(eq(voiceSessions.id, id));
    },

    async getRoleForLevel(guildId: string, level: number): Promise<LevelRole | null> {
        const [role] = await db.select().from(levelRoles)
            .where(and(eq(levelRoles.guildId, guildId), eq(levelRoles.level, level)));
        return role ?? null;
    },

    async getSpecialChannel(guildId: string, channelId: string): Promise<SpecialChannel | null> {
        const [channel] = await db.select().from(specialChannels)
            .where(and(eq(specialChannels.guildId, guildId), eq(specialChannels.channelId, channelId)));
        return channel ?? null;
    },

    async getLevelingConfig(guildId: string) {
        const [setting] = await db.select({
            isLevelingNotificationActive: guildSettings.isLevelingNotificationActive,
            levelingNotificationChannelId: guildSettings.levelingNotificationChannelId,
            levelingNotificationTemplate: guildSettings.levelingNotificationTemplate,
            levelingCooldownMs: guildSettings.levelingCooldownMs,
            levelingMinXpText: guildSettings.levelingMinXpText,
            levelingMaxXpText: guildSettings.levelingMaxXpText,
            levelingMinXpVoice: guildSettings.levelingMinXpVoice,
            levelingMaxXpVoice: guildSettings.levelingMaxXpVoice,
        }).from(guildSettings).where(eq(guildSettings.guildId, guildId));
        return setting ?? null;
    },
};
