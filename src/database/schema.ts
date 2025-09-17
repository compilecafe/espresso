import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const levelingUserLevelsTable = pgTable("leveling_user_levels", {
    id: varchar("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 32 }).notNull(),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(0),
});

export type SelectLevelingUserLevel = typeof levelingUserLevelsTable.$inferSelect;
export type InsertLevelingUserLevel = typeof levelingUserLevelsTable.$inferInsert;

export const levelingVoiceSessionsTable = pgTable("leveling_voice_sessions", {
    id: varchar("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 32 }).notNull(),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    channelId: varchar("channel_id", { length: 32 }).notNull(),
    startTime: timestamp("start_time").notNull(),
});

export type SelectLevelingVoiceSession = typeof levelingVoiceSessionsTable.$inferSelect;
export type InsertLevelingVoiceSession = typeof levelingVoiceSessionsTable.$inferInsert;

export const levelingRolesTable = pgTable("leveling_roles", {
    id: varchar("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    level: integer("level").notNull(),
    roleId: varchar("role_id", { length: 32 }).notNull(),
});

export type SelectLevelingRole = typeof levelingRolesTable.$inferSelect;
export type InsertLevelingRole = typeof levelingRolesTable.$inferInsert;

export const levelingSpecialChannelsTable = pgTable("leveling_special_channels", {
    id: varchar("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    channelId: varchar("channel_id", { length: 32 }).notNull(),
    modifier: integer("modifier").notNull().default(100),
    blacklisted: boolean("blacklisted").notNull().default(false),
});

export type SelectLevelingSpecialChannel = typeof levelingSpecialChannelsTable.$inferSelect;
export type InsertLevelingSpecialChannel = typeof levelingSpecialChannelsTable.$inferInsert;

export const guildSettingsTable = pgTable("guild_settings", {
    guildId: varchar("guild_id", { length: 32 }).primaryKey(),
    isLevelingNotificationActive: boolean("is_leveling_notification_active").notNull().default(true),
    levelingNotificationChannelId: varchar("leveling_notification_channel_id", { length: 32 }),
    levelingNotificaitonTemplate: varchar("leveling_notificaiton_template", { length: 255 })
        .notNull()
        .default("{user}, you have reached level {level}!"),
    boosterReferenceRoleId: varchar("booster_reference_role_id", { length: 32 }),
});

export type SelectGuildSetting = typeof guildSettingsTable.$inferSelect;
export type InsertGuildSetting = typeof guildSettingsTable.$inferInsert;

export const boosterRolesTable = pgTable("booster_roles", {
    id: varchar("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    userId: varchar("user_id", { length: 32 }).notNull(),
    roleId: varchar("role_id", { length: 32 }).notNull(),
});

export type SelectBoosterRole = typeof boosterRolesTable.$inferSelect;
export type InsertBoosterRole = typeof boosterRolesTable.$inferInsert;
