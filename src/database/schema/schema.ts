import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const userLevels = pgTable("leveling_user_levels", {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 32 }).notNull(),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    textXp: integer("text_xp").notNull().default(0),
    voiceXp: integer("voice_xp").notNull().default(0),
    level: integer("level").notNull().default(0),
});

export const voiceSessions = pgTable("leveling_voice_sessions", {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 32 }).notNull(),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    channelId: varchar("channel_id", { length: 32 }).notNull(),
    startTime: timestamp("start_time").notNull().defaultNow(),
});

export const levelRoles = pgTable("leveling_roles", {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    level: integer("level").notNull(),
    roleId: varchar("role_id", { length: 32 }).notNull(),
});

export const specialChannels = pgTable("leveling_special_channels", {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    channelId: varchar("channel_id", { length: 32 }).notNull(),
    modifier: integer("modifier").notNull().default(100),
    blacklisted: boolean("blacklisted").notNull().default(false),
});

export const guildSettings = pgTable("guild_settings", {
    guildId: varchar("guild_id", { length: 32 }).primaryKey(),
    isLevelingNotificationActive: boolean("is_leveling_notification_active").notNull().default(true),
    levelingNotificationChannelId: varchar("leveling_notification_channel_id", { length: 32 }),
    levelingNotificationTemplate: varchar("leveling_notification_template", { length: 255 }).notNull().default("{user}, you have reached level {level}!"),
    levelingCooldownMs: integer("leveling_cooldown_ms").notNull().default(5_000),
    levelingMinXpText: integer("leveling_min_xp_text").notNull().default(5),
    levelingMaxXpText: integer("leveling_max_xp_text").notNull().default(15),
    levelingMinXpVoice: integer("leveling_min_xp_voice").notNull().default(1),
    levelingMaxXpVoice: integer("leveling_max_xp_voice").notNull().default(5),
    boosterReferenceRoleId: varchar("booster_reference_role_id", { length: 32 }),
    autoRoleUserRoleId: varchar("auto_role_user_role_id", { length: 32 }),
    autoRoleBotRoleId: varchar("auto_role_bot_role_id", { length: 32 }),
});

export const boosterRoles = pgTable("booster_roles", {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    userId: varchar("user_id", { length: 32 }).notNull(),
    roleId: varchar("role_id", { length: 32 }).notNull(),
});

// Type exports
export type UserLevel = typeof userLevels.$inferSelect;
export type NewUserLevel = typeof userLevels.$inferInsert;
export type VoiceSession = typeof voiceSessions.$inferSelect;
export type NewVoiceSession = typeof voiceSessions.$inferInsert;
export type LevelRole = typeof levelRoles.$inferSelect;
export type SpecialChannel = typeof specialChannels.$inferSelect;
export type GuildSetting = typeof guildSettings.$inferSelect;
export type NewGuildSetting = typeof guildSettings.$inferInsert;
export type BoosterRole = typeof boosterRoles.$inferSelect;
export type NewBoosterRole = typeof boosterRoles.$inferInsert;
