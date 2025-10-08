import {
    AuditLogEvent,
    EmbedBuilder,
    Guild,
    User,
    ChannelType,
    Role,
    TextChannel,
    VoiceChannel,
    NewsChannel,
    StageChannel,
    CategoryChannel,
    GuildMember,
    Message,
    VoiceState,
    GuildBan,
    type GuildBasedChannel,
    type PartialGuildMember,
    type PartialMessage,
    Invite,
    Emoji,
    Sticker,
    ThreadChannel,
    Integration,
    GuildScheduledEvent,
    Webhook,
    Collection,
    PermissionOverwrites,
    type Snowflake,
} from "discord.js";

// Constants
const COLORS = {
    server: 0x2b90d9,
    member: 0x2ecc71,
    message: 0xe67e22,
    voice: 0x9b59b6,
    joinLeave: 0x1abc9c,
    warn: 0xe74c3c,
} as const;

const EMOJIS = {
    server: "🔧",
    member: "👤",
    message: "💬",
    voice: "🎤",
    join: "✅",
    leave: "❌",
    warn: "⚠️",
    ban: "🔨",
    unban: "🔓",
    kick: "👢",
    emoji: "😀",
    sticker: "🏷️",
    invite: "📩",
    thread: "🧵",
} as const;

// Utility Functions
function truncate(str: string, max = 1024): string {
    return str.length > max ? `${str.substring(0, max - 3)}...` : str;
}

function formatPermission(perm: string): string {
    return perm.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

function formatChannelType(type: ChannelType): string {
    return ChannelType[type].replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

export function baseEmbed(title: string, color: number, emoji: string = "") {
    return new EmbedBuilder()
        .setTitle(`${emoji} ${title}`)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: "Audit Log", iconURL: "https://i.imgur.com/8BzQk5r.png" });
}

function getChannelDisplayName(channel: GuildBasedChannel): string {
    if (
        channel instanceof TextChannel ||
        channel instanceof VoiceChannel ||
        channel instanceof NewsChannel ||
        channel instanceof StageChannel ||
        channel instanceof CategoryChannel
    ) {
        return `#${channel.name}`;
    }
    return `#${channel.id}`;
}

function formatOverwrites(overwrites: Collection<string, PermissionOverwrites>): string {
    if (overwrites.size === 0) return "No overwrites set";

    return overwrites
        .map((o) => {
            const target = o.type === 0 ? `Role: <@&${o.id}>` : `Member: <@!${o.id}>`;
            const allowed = o.allow.toArray().map(formatPermission).join(", ") || "None";
            const denied = o.deny.toArray().map(formatPermission).join(", ") || "None";
            return `${target}\n✅ ${allowed}\n❌ ${denied}`;
        })
        .join("\n\n");
}

function compareOverwrites(
    oldOverwrites: Collection<string, PermissionOverwrites>,
    newOverwrites: Collection<string, PermissionOverwrites>
): string[] {
    const changes: string[] = [];

    if (oldOverwrites.size !== newOverwrites.size) {
        changes.push(`**Overwrite Count**: ${oldOverwrites.size} → **${newOverwrites.size}**`);
    }

    oldOverwrites.forEach((oldPerm, id) => {
        const newPerm = newOverwrites.get(id);
        if (!newPerm) {
            const target = oldPerm.type === 0 ? `Role: <@&${id}>` : `Member: <@!${id}>`;
            changes.push(`**Removed Overwrite**: ${target}`);
        } else {
            const oldAllowed = oldPerm.allow.toArray().sort();
            const newAllowed = newPerm.allow.toArray().sort();
            if (JSON.stringify(oldAllowed) !== JSON.stringify(newAllowed)) {
                const added = newAllowed.filter((p) => !oldAllowed.includes(p)).map(formatPermission);
                const removed = oldAllowed.filter((p) => !newAllowed.includes(p)).map(formatPermission);
                const target = oldPerm.type === 0 ? `Role: <@&${id}>` : `Member: <@!${id}>`;
                if (added.length > 0) {
                    changes.push(`**${target} Added Permissions**: ${added.join(", ")}`);
                }
                if (removed.length > 0) {
                    changes.push(`**${target} Removed Permissions**: ${removed.join(", ")}`);
                }
            }

            const oldDenied = oldPerm.deny.toArray().sort();
            const newDenied = newPerm.deny.toArray().sort();
            if (JSON.stringify(oldDenied) !== JSON.stringify(newDenied)) {
                const added = newDenied.filter((p) => !oldDenied.includes(p)).map(formatPermission);
                const removed = oldDenied.filter((p) => !newDenied.includes(p)).map(formatPermission);
                const target = oldPerm.type === 0 ? `Role: <@&${id}>` : `Member: <@!${id}>`;
                if (added.length > 0) {
                    changes.push(`**${target} Added Denied Permissions**: ${added.join(", ")}`);
                }
                if (removed.length > 0) {
                    changes.push(`**${target} Removed Denied Permissions**: ${removed.join(", ")}`);
                }
            }
        }
    });

    newOverwrites.forEach((newPerm, id) => {
        if (!oldOverwrites.has(id)) {
            const target = newPerm.type === 0 ? `Role: <@&${id}>` : `Member: <@!${id}>`;
            changes.push(`**Added Overwrite**: ${target}`);
        }
    });

    return changes;
}

// Audit Log Helper
export async function getExecutorFromAudit(
    guild: Guild,
    type: AuditLogEvent,
    targetId?: Snowflake
): Promise<string | undefined> {
    try {
        const logs = await guild.fetchAuditLogs({ limit: 6, type });
        const entry = logs.entries.find((e) => {
            if (!targetId) return true;
            return e.targetId === targetId;
        });

        if (entry?.executor) {
            return `${entry.executor.tag} (${entry.executor.id})`;
        }
    } catch (err) {
        console.debug("audit fetch failed", err);
    }
    return undefined;
}

// Embed Creation Helpers
function addAuditLogField(
    embed: EmbedBuilder,
    guild: Guild | undefined,
    auditType: AuditLogEvent,
    targetId: Snowflake,
    fieldName: string
) {
    if (!guild) return embed;

    return getExecutorFromAudit(guild, auditType, targetId)
        .then((exec) => {
            embed.addFields({
                name: fieldName,
                value: exec || "Unknown [Unverified]",
                inline: true,
            });
            return embed;
        })
        .catch(() => {
            embed.addFields({
                name: fieldName,
                value: "Unknown [Unverified]",
                inline: true,
            });
            return embed;
        });
}

// --- SERVER EVENTS GROUP ---
export async function channelCreatedEmbed(channel: GuildBasedChannel, guild?: Guild) {
    const embed = baseEmbed("Channel Created", COLORS.server, EMOJIS.server)
        .setDescription(`**New channel created**: ${getChannelDisplayName(channel)}`)
        .addFields(
            { name: "🆔 Channel ID", value: channel.id, inline: true },
            { name: "📂 Type", value: formatChannelType(channel.type), inline: true },
            { name: "🔒 NSFW", value: "nsfw" in channel ? (channel.nsfw ? "Yes" : "No") : "N/A", inline: true },
            { name: "📍 Position", value: `${"position" in channel ? channel.position : "N/A"}`, inline: true },
            { name: "📁 Parent", value: channel.parent ? channel.parent.name : "None", inline: true }
        );

    if ("topic" in channel && channel.topic) {
        embed.addFields({ name: "📝 Topic", value: truncate(channel.topic, 512), inline: false });
    }

    if ("rateLimitPerUser" in channel && channel.rateLimitPerUser) {
        embed.addFields({ name: "⏳ Slowmode", value: `${channel.rateLimitPerUser} seconds`, inline: true });
    }

    if ("permissionOverwrites" in channel && channel.permissionOverwrites.cache.size > 0) {
        const overwrites = formatOverwrites(channel.permissionOverwrites.cache);
        embed.addFields({
            name: "🔐 Permission Overwrites",
            value: truncate(overwrites, 1024),
        });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.ChannelCreate, channel.id, "👤 Created By");
}

export async function channelDeletedEmbed(channel: GuildBasedChannel, guild?: Guild) {
    const embed = baseEmbed("Channel Deleted", COLORS.server, EMOJIS.server)
        .setDescription(`**Channel deleted**: ${getChannelDisplayName(channel)}`)
        .addFields(
            { name: "🆔 Channel ID", value: channel.id, inline: true },
            { name: "📂 Type", value: formatChannelType(channel.type), inline: true },
            { name: "📍 Position", value: `${"position" in channel ? channel.position : "N/A"}`, inline: true },
            { name: "📁 Parent", value: channel.parent ? channel.parent.name : "None", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.ChannelDelete, channel.id, "👤 Deleted By");
}

export async function channelUpdatedEmbed(oldChannel: GuildBasedChannel, newChannel: GuildBasedChannel, guild?: Guild) {
    const embed = baseEmbed("Channel Updated", COLORS.server, EMOJIS.server)
        .setDescription(`**Channel updated**: ${getChannelDisplayName(newChannel)}`)
        .addFields(
            { name: "🆔 Channel ID", value: newChannel.id, inline: true },
            { name: "📂 Type", value: formatChannelType(newChannel.type), inline: true }
        );

    const changes: string[] = [];

    if (oldChannel.name !== newChannel.name) {
        changes.push(`**Name**: ${oldChannel.name} → **${newChannel.name}**`);
    }

    if ("nsfw" in oldChannel && "nsfw" in newChannel && oldChannel.nsfw !== newChannel.nsfw) {
        changes.push(`**NSFW**: ${oldChannel.nsfw ? "Yes" : "No"} → **${newChannel.nsfw ? "Yes" : "No"}**`);
    }

    if ("position" in oldChannel && "position" in newChannel && oldChannel.position !== newChannel.position) {
        changes.push(`**Position**: ${oldChannel.position} → **${newChannel.position}**`);
    }

    if ("topic" in oldChannel && "topic" in newChannel && oldChannel.topic !== newChannel.topic) {
        changes.push(
            `**Topic**: ${truncate(oldChannel.topic || "None", 512)} → **${truncate(newChannel.topic || "None", 512)}**`
        );
    }

    if (
        "rateLimitPerUser" in oldChannel &&
        "rateLimitPerUser" in newChannel &&
        oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser
    ) {
        changes.push(
            `**Slowmode**: ${oldChannel.rateLimitPerUser || 0} sec → **${newChannel.rateLimitPerUser || 0} sec**`
        );
    }

    if (oldChannel.parentId !== newChannel.parentId) {
        const oldParent = oldChannel.parent ? oldChannel.parent.name : "None";
        const newParent = newChannel.parent ? newChannel.parent.name : "None";
        changes.push(`**Parent**: ${oldParent} → **${newParent}**`);
    }

    if ("permissionOverwrites" in oldChannel && "permissionOverwrites" in newChannel) {
        const overwriteChanges = compareOverwrites(
            oldChannel.permissionOverwrites.cache,
            newChannel.permissionOverwrites.cache
        );
        if (overwriteChanges.length > 0) {
            changes.push(...overwriteChanges);
        }
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n"), 1024) });
    } else {
        embed.addFields({ name: "🔄 Changes", value: "No visible changes detected" });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.ChannelUpdate, newChannel.id, "👤 Updated By");
}

export async function roleCreateEmbed(role: Role, guild?: Guild) {
    const perms = role.permissions.toArray().map(formatPermission);

    const embed = baseEmbed("Role Created", COLORS.server, EMOJIS.server)
        .setDescription(`**New role created**: <@&${role.id}>`)
        .addFields(
            { name: "🆔 Role ID", value: role.id, inline: true },
            { name: "🎨 Color", value: role.hexColor || "Default", inline: true },
            { name: "📌 Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
            { name: "🔔 Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
            { name: "📍 Position", value: `${role.position}`, inline: true }
        );

    if (perms.length > 0) {
        embed.addFields({
            name: "🔑 Key Permissions",
            value: truncate(perms.join(", ")),
        });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.RoleCreate, role.id, "👤 Created By");
}

export async function roleDeletedEmbed(role: Role, guild?: Guild) {
    const embed = baseEmbed("Role Deleted", COLORS.server, EMOJIS.server)
        .setDescription(`**Role deleted**: @${role.name}`)
        .addFields(
            { name: "🆔 Role ID", value: role.id, inline: true },
            { name: "🎨 Color", value: role.hexColor || "Default", inline: true },
            { name: "📍 Position", value: `${role.position}`, inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.RoleDelete, role.id, "👤 Deleted By");
}

export async function roleUpdatedEmbed(oldRole: Role, newRole: Role, guild?: Guild) {
    const embed = baseEmbed("Role Updated", COLORS.server, EMOJIS.server)
        .setDescription(`**Role updated**: <@&${newRole.id}>`)
        .addFields({ name: "🆔 Role ID", value: newRole.id, inline: true });

    const changes: string[] = [];

    if (oldRole.name !== newRole.name) {
        changes.push(`**Name**: @${oldRole.name} → **@${newRole.name}**`);
    }

    if (oldRole.hexColor !== newRole.hexColor) {
        changes.push(`**Color**: ${oldRole.hexColor || "Default"} → **${newRole.hexColor || "Default"}**`);
    }

    if (oldRole.hoist !== newRole.hoist) {
        changes.push(`**Hoisted**: ${oldRole.hoist ? "Yes" : "No"} → **${newRole.hoist ? "Yes" : "No"}**`);
    }

    if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(
            `**Mentionable**: ${oldRole.mentionable ? "Yes" : "No"} → **${newRole.mentionable ? "Yes" : "No"}**`
        );
    }

    if (oldRole.position !== newRole.position) {
        changes.push(`**Position**: ${oldRole.position} → **${newRole.position}**`);
    }

    const oldPerms = oldRole.permissions.toArray();
    const newPerms = newRole.permissions.toArray();

    if (JSON.stringify(oldPerms.sort()) !== JSON.stringify(newPerms.sort())) {
        const added = newPerms.filter((p) => !oldPerms.includes(p)).map(formatPermission);
        const removed = oldPerms.filter((p) => !newPerms.includes(p)).map(formatPermission);

        if (added.length > 0) {
            changes.push(`**+ Added Permissions**: ${added.join(", ")}`);
        }

        if (removed.length > 0) {
            changes.push(`**- Removed Permissions**: ${removed.join(", ")}`);
        }
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.RoleUpdate, newRole.id, "👤 Updated By");
}

export async function guildUpdatedEmbed(oldGuild: Guild, newGuild: Guild) {
    const embed = baseEmbed("Server Updated", COLORS.server, EMOJIS.server)
        .setDescription(`**Server updated**: ${newGuild.name}`)
        .addFields({ name: "🆔 Server ID", value: newGuild.id, inline: true });

    const changes: string[] = [];

    if (oldGuild.name !== newGuild.name) {
        changes.push(`**Name**: ${oldGuild.name} → **${newGuild.name}**`);
    }

    if (oldGuild.icon !== newGuild.icon) {
        changes.push(`**Icon**: Changed`);
    }

    if (oldGuild.banner !== newGuild.banner) {
        changes.push(`**Banner**: Changed`);
    }

    if (oldGuild.description !== newGuild.description) {
        changes.push(
            `**Description**: ${truncate(oldGuild.description || "None")} → **${truncate(
                newGuild.description || "None"
            )}**`
        );
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    }

    return addAuditLogField(embed, newGuild, AuditLogEvent.GuildUpdate, newGuild.id, "👤 Updated By");
}

export async function emojiCreatedEmbed(emoji: Emoji, guild?: Guild) {
    const embed = baseEmbed("Emoji Created", COLORS.server, EMOJIS.emoji)
        .setDescription(`**New emoji created**: ${emoji.name} (${emoji})`)
        .addFields(
            { name: "🆔 Emoji ID", value: emoji.id || "N/A", inline: true },
            { name: "📛 Name", value: emoji.name || "Unknown", inline: true },
            { name: "🎭 Animated", value: emoji.animated ? "Yes" : "No", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.EmojiCreate, emoji.id || ("" as Snowflake), "👤 Created By");
}

export async function emojiDeletedEmbed(emoji: Emoji, guild?: Guild) {
    const embed = baseEmbed("Emoji Deleted", COLORS.server, EMOJIS.emoji)
        .setDescription(`**Emoji deleted**: ${emoji.name}`)
        .addFields(
            { name: "🆔 Emoji ID", value: emoji.id || "N/A", inline: true },
            { name: "📛 Name", value: emoji.name || "Unknown", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.EmojiDelete, emoji.id || ("" as Snowflake), "👤 Deleted By");
}

export async function emojiUpdatedEmbed(oldEmoji: Emoji, newEmoji: Emoji, guild?: Guild) {
    const embed = baseEmbed("Emoji Updated", COLORS.server, EMOJIS.emoji)
        .setDescription(`**Emoji updated**: ${newEmoji.name} (${newEmoji})`)
        .addFields({ name: "🆔 Emoji ID", value: newEmoji.id || "N/A", inline: true });

    const changes: string[] = [];

    if (oldEmoji.name !== newEmoji.name) {
        changes.push(`**Name**: ${oldEmoji.name} → **${newEmoji.name}**`);
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.EmojiUpdate, newEmoji.id || ("" as Snowflake), "👤 Updated By");
}

export async function stickerCreatedEmbed(sticker: Sticker, guild?: Guild) {
    const embed = baseEmbed("Sticker Created", COLORS.server, EMOJIS.sticker)
        .setDescription(`**New sticker created**: ${sticker.name}`)
        .addFields(
            { name: "🆔 Sticker ID", value: sticker.id, inline: true },
            { name: "📛 Name", value: sticker.name, inline: true },
            { name: "📝 Description", value: sticker.description || "None", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.StickerCreate, sticker.id, "👤 Created By");
}

export async function stickerDeletedEmbed(sticker: Sticker, guild?: Guild) {
    const embed = baseEmbed("Sticker Deleted", COLORS.server, EMOJIS.sticker)
        .setDescription(`**Sticker deleted**: ${sticker.name}`)
        .addFields(
            { name: "🆔 Sticker ID", value: sticker.id, inline: true },
            { name: "📛 Name", value: sticker.name, inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.StickerDelete, sticker.id, "👤 Deleted By");
}

export async function stickerUpdatedEmbed(oldSticker: Sticker, newSticker: Sticker, guild?: Guild) {
    const embed = baseEmbed("Sticker Updated", COLORS.server, EMOJIS.sticker)
        .setDescription(`**Sticker updated**: ${newSticker.name}`)
        .addFields({ name: "🆔 Sticker ID", value: newSticker.id, inline: true });

    const changes: string[] = [];

    if (oldSticker.name !== newSticker.name) {
        changes.push(`**Name**: ${oldSticker.name} → **${newSticker.name}**`);
    }

    if (oldSticker.description !== newSticker.description) {
        changes.push(
            `**Description**: ${truncate(oldSticker.description || "None")} → **${truncate(
                newSticker.description || "None"
            )}**`
        );
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.StickerUpdate, newSticker.id, "👤 Updated By");
}

// Fix for inviteCreatedEmbed
export async function inviteCreatedEmbed(invite: Invite, guild?: Guild) {
    const embed = baseEmbed("Invite Created", COLORS.server, EMOJIS.invite)
        .setDescription(`**New invite created** by <@${invite.inviter?.id || "Unknown"}>`)
        .addFields(
            { name: "🔗 Code", value: invite.code, inline: true },
            { name: "💬 Channel", value: invite.channel?.name || "Unknown", inline: true },
            { name: "⏳ Expires", value: invite.expiresAt?.toUTCString() || "Never", inline: true },
            { name: "📊 Max Uses", value: `${invite.maxUses || "Unlimited"}`, inline: true }
        );

    if (guild) {
        const resultEmbed = await addAuditLogField(
            embed,
            guild,
            AuditLogEvent.InviteCreate,
            invite.code,
            "👤 Created By"
        );

        if (
            resultEmbed.data.fields?.some((f) => f.name === "👤 Created By" && f.value === "Unknown [Unverified]") &&
            invite.inviter?.tag
        ) {
            const fieldIndex = resultEmbed.data.fields?.findIndex((f) => f.name === "👤 Created By") ?? -1;
            if (fieldIndex !== -1) {
                resultEmbed.spliceFields(fieldIndex, 1, {
                    name: "👤 Created By",
                    value: invite.inviter.tag,
                    inline: true,
                });
            }
        }
        return resultEmbed;
    }
    return embed;
}

export async function inviteDeletedEmbed(invite: Invite, guild?: Guild) {
    const embed = baseEmbed("Invite Deleted", COLORS.server, EMOJIS.invite)
        .setDescription(`**Invite deleted**: ${invite.code}`)
        .addFields(
            { name: "🔗 Code", value: invite.code, inline: true },
            { name: "💬 Channel", value: invite.channel?.name || "Unknown", inline: true },
            { name: "📊 Uses", value: `${invite.uses || 0}`, inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.InviteDelete, invite.code, "👤 Deleted By");
}

export async function threadCreatedEmbed(thread: ThreadChannel, guild?: Guild) {
    const embed = baseEmbed("Thread Created", COLORS.server, EMOJIS.thread)
        .setDescription(`**New thread created**: #${thread.name}`)
        .addFields(
            { name: "🆔 Thread ID", value: thread.id, inline: true },
            { name: "📂 Parent Channel", value: thread.parent?.name || "Unknown", inline: true },
            { name: "🔒 Archived", value: thread.archived ? "Yes" : "No", inline: true },
            { name: "⏳ Auto Archive", value: `${thread.autoArchiveDuration || "N/A"} minutes`, inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.ThreadCreate, thread.id, "👤 Created By");
}

export async function threadDeletedEmbed(thread: ThreadChannel, guild?: Guild) {
    const embed = baseEmbed("Thread Deleted", COLORS.server, EMOJIS.thread)
        .setDescription(`**Thread deleted**: #${thread.name}`)
        .addFields(
            { name: "🆔 Thread ID", value: thread.id, inline: true },
            { name: "📂 Parent Channel", value: thread.parent?.name || "Unknown", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.ThreadDelete, thread.id, "👤 Deleted By");
}

export async function threadUpdatedEmbed(oldThread: ThreadChannel, newThread: ThreadChannel, guild?: Guild) {
    const embed = baseEmbed("Thread Updated", COLORS.server, EMOJIS.thread)
        .setDescription(`**Thread updated**: #${newThread.name}`)
        .addFields({ name: "🆔 Thread ID", value: newThread.id, inline: true });

    const changes: string[] = [];

    if (oldThread.name !== newThread.name) {
        changes.push(`**Name**: ${oldThread.name} → **${newThread.name}**`);
    }

    if (oldThread.archived !== newThread.archived) {
        changes.push(`**Archived**: ${oldThread.archived ? "Yes" : "No"} → **${newThread.archived ? "Yes" : "No"}**`);
    }

    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
        changes.push(
            `**Auto Archive**: ${oldThread.autoArchiveDuration || "N/A"} min → **${
                newThread.autoArchiveDuration || "N/A"
            } min**`
        );
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    }

    return addAuditLogField(embed, guild, AuditLogEvent.ThreadUpdate, newThread.id, "👤 Updated By");
}

export async function webhookCreatedEmbed(webhook: Webhook, guild?: Guild) {
    const embed = baseEmbed("Webhook Created", COLORS.server, EMOJIS.server)
        .setDescription(`**New webhook created**: ${webhook.name}`)
        .addFields(
            { name: "🆔 Webhook ID", value: webhook.id, inline: true },
            { name: "💬 Channel", value: webhook.channel?.name || "Unknown", inline: true },
            { name: "🔗 Token", value: webhook.token ? "Present" : "None", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.WebhookCreate, webhook.id, "👤 Created By");
}

export async function integrationCreatedEmbed(integration: Integration, guild?: Guild) {
    const embed = baseEmbed("Integration Created", COLORS.server, EMOJIS.server)
        .setDescription(`**New integration added**: ${integration.name}`)
        .addFields(
            { name: "🆔 Integration ID", value: integration.id, inline: true },
            { name: "📛 Type", value: integration.type, inline: true },
            { name: "👤 Account", value: integration.account?.name || "Unknown", inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.IntegrationCreate, integration.id, "👤 Created By");
}

export async function eventCreatedEmbed(event: GuildScheduledEvent, guild?: Guild) {
    const embed = baseEmbed("Scheduled Event Created", COLORS.server, EMOJIS.server)
        .setDescription(`**New event created**: ${event.name}`)
        .addFields(
            { name: "🆔 Event ID", value: event.id, inline: true },
            { name: "📅 Start Time", value: event.scheduledStartAt?.toUTCString() || "N/A", inline: true },
            {
                name: "📍 Location",
                value: event.channel?.name || event.entityMetadata?.location || "N/A",
                inline: true,
            },
            { name: "📝 Description", value: truncate(event.description || "None", 512), inline: false }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.GuildScheduledEventCreate, event.id, "👤 Created By");
}

// --- MEMBER EVENTS GROUP ---
export function memberJoinEmbed(member: GuildMember) {
    const accountAge = Math.floor((Date.now() - member.user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return baseEmbed("Member Joined", COLORS.joinLeave, EMOJIS.join)
        .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({ size: 64 }),
        })
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .addFields(
            { name: "🆔 User ID", value: member.id, inline: true },
            { name: "👥 Member Count", value: `${member.guild.memberCount}`, inline: true },
            { name: "📅 Account Age", value: `${accountAge} days`, inline: true },
            { name: "🕐 Created At", value: member.user.createdAt.toUTCString(), inline: false },
            { name: "🕒 Joined At", value: member.joinedAt?.toUTCString() || "Now", inline: false },
            {
                name: "📋 Roles",
                value: member.roles.cache.map((r) => `<@&${r.id}>`).join(", ") || "None",
                inline: false,
            }
        );
}

export function memberLeaveEmbed(member: GuildMember | PartialGuildMember) {
    const durationMs = member.joinedTimestamp ? Date.now() - member.joinedTimestamp : 0;
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

    return baseEmbed("Member Left", COLORS.joinLeave, EMOJIS.leave)
        .setAuthor({
            name: member.user?.tag || "Unknown",
            iconURL: member.user?.displayAvatarURL({ size: 64 }) || "",
        })
        .addFields(
            { name: "🆔 User ID", value: member.id, inline: true },
            { name: "👥 Remaining Members", value: `${member.guild?.memberCount || "Unknown"}`, inline: true },
            { name: "🕒 Time in Server", value: `${durationDays} days`, inline: true },
            { name: "🕐 Joined At", value: member.joinedAt?.toUTCString() || "Unknown", inline: false }
        );
}

export function memberUpdatedEmbed(oldMember: GuildMember, newMember: GuildMember) {
    const embed = baseEmbed("Member Updated", COLORS.member, EMOJIS.member)
        .setAuthor({
            name: newMember.user.tag,
            iconURL: newMember.user.displayAvatarURL({ size: 64 }),
        })
        .addFields({ name: "🆔 User ID", value: newMember.id, inline: true });

    const changes: string[] = [];

    if (oldMember.nickname !== newMember.nickname) {
        changes.push(`**Nickname**: ${oldMember.nickname || "None"} → **${newMember.nickname || "None"}**`);
    }

    const oldRoles = oldMember.roles.cache.map((r) => r.id).sort();
    const newRoles = newMember.roles.cache.map((r) => r.id).sort();

    if (JSON.stringify(oldRoles) !== JSON.stringify(newRoles)) {
        const added = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id)).map((r) => `<@&${r.id}>`);
        const removed = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id)).map((r) => `<@&${r.id}>`);

        if (added.length > 0) {
            changes.push(`**+ Added Roles**: ${added.join(", ")}`);
        }

        if (removed.length > 0) {
            changes.push(`**- Removed Roles**: ${removed.join(", ")}`);
        }
    }

    if (oldMember.pending !== newMember.pending) {
        changes.push(
            `**Verification**: ${oldMember.pending ? "Pending" : "Verified"} → **${
                newMember.pending ? "Pending" : "Verified"
            }**`
        );
    }

    if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
        const oldTimeout = oldMember.communicationDisabledUntil
            ? oldMember.communicationDisabledUntil.toUTCString()
            : "None";
        const newTimeout = newMember.communicationDisabledUntil
            ? newMember.communicationDisabledUntil.toUTCString()
            : "None";
        changes.push(`**Timeout**: ${oldTimeout} → **${newTimeout}**`);
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    } else {
        embed.addFields({ name: "🔄 Changes", value: "No visible changes detected" });
    }

    return embed;
}

export async function userBannedEmbed(guild: Guild, ban: GuildBan) {
    let reason = ban.reason || "No reason provided";
    let executor: string | undefined;

    try {
        executor = await getExecutorFromAudit(guild, AuditLogEvent.MemberBanAdd, ban.user.id).catch(() => undefined);

        const banEntry = await guild.bans.fetch(ban.user).catch(() => undefined);
        if (banEntry && banEntry.reason) {
            reason = banEntry.reason;
        }
    } catch (error) {
        console.error("Error fetching ban details:", error);
    }

    const accountAge = Math.floor((Date.now() - ban.user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return baseEmbed("User Banned", COLORS.warn, EMOJIS.ban)
        .setAuthor({
            name: ban.user.tag,
            iconURL: ban.user.displayAvatarURL({ size: 64 }),
        })
        .setThumbnail(ban.user.displayAvatarURL({ size: 256 }))
        .addFields(
            { name: "🆔 User ID", value: ban.user.id, inline: true },
            { name: "👤 Banned By", value: executor || "Unknown [Unverified]", inline: true },
            { name: "📅 Account Created", value: ban.user.createdAt.toUTCString(), inline: true },
            { name: "📅 Account Age", value: `${accountAge} days`, inline: true },
            { name: "📋 Reason", value: truncate(reason, 512), inline: false }
        );
}

export async function userUnbannedEmbed(guild: Guild, user: User) {
    const exec = await getExecutorFromAudit(guild, AuditLogEvent.MemberBanRemove, user.id).catch(() => undefined);

    let reason = "No reason provided";
    try {
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
        const entry = logs.entries.find((e) => e.target?.id === user.id);
        reason = entry?.reason || reason;
    } catch {}

    return baseEmbed("User Unbanned", COLORS.warn, EMOJIS.unban)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ size: 64 }),
        })
        .addFields(
            { name: "🆔 User ID", value: user.id, inline: true },
            { name: "👤 Unbanned By", value: exec || "Unknown [Unverified]", inline: true },
            { name: "📋 Reason", value: reason, inline: false }
        );
}

export function userWarnEmbed(user: User, reason: string) {
    return baseEmbed("User Warned", COLORS.warn, EMOJIS.warn)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ size: 64 }),
        })
        .addFields(
            { name: "🆔 User ID", value: user.id, inline: true },
            { name: "📅 Account Created", value: user.createdAt.toUTCString(), inline: true },
            { name: "📋 Reason", value: reason || "No reason provided", inline: false }
        );
}

export async function userKickEmbed(guild: Guild, user: User) {
    const exec = await getExecutorFromAudit(guild, AuditLogEvent.MemberKick, user.id).catch(() => undefined);

    let reason = "No reason provided";
    try {
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
        const entry = logs.entries.find((e) => e.target?.id === user.id);
        reason = entry?.reason || reason;
    } catch {}

    return baseEmbed("User Kicked", COLORS.warn, EMOJIS.kick)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ size: 64 }),
        })
        .addFields(
            { name: "🆔 User ID", value: user.id, inline: true },
            { name: "👤 Kicked By", value: exec || "Unknown [Unverified]", inline: true },
            { name: "📋 Reason", value: reason, inline: false }
        );
}

export async function memberTimeoutEmbed(member: GuildMember, guild: Guild) {
    let reason = "No reason provided";
    let executor: string | undefined;

    try {
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
        const entry = logs.entries.find(
            (e) => e.target?.id === member.id && e.changes.some((c) => c.key === "communication_disabled_until")
        );
        reason = entry?.reason || reason;
        executor = entry?.executor?.tag || "Unknown";
    } catch {}

    const timeoutUntil = member.communicationDisabledUntil?.toUTCString() || "Removed";

    return baseEmbed("Member Timeout Updated", COLORS.warn, EMOJIS.warn)
        .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({ size: 64 }),
        })
        .addFields(
            { name: "🆔 User ID", value: member.id, inline: true },
            { name: "👤 Updated By", value: executor || "Unknown [Unverified]", inline: true },
            { name: "⏳ Timeout Until", value: timeoutUntil, inline: true },
            { name: "📋 Reason", value: truncate(reason, 512), inline: false }
        );
}

// --- MESSAGE EVENTS GROUP ---
export function messageDeletedEmbed(message: Message | PartialMessage) {
    const jumpUrl = message.guildId
        ? `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
        : null;

    const embed = baseEmbed("Message Deleted", COLORS.message, EMOJIS.message)
        .setAuthor({
            name: message.author?.tag || "Unknown",
            iconURL: message.author?.displayAvatarURL({ size: 64 }) || "",
        })
        .addFields(
            { name: "🆔 Author ID", value: message.author?.id || "Unknown", inline: true },
            {
                name: "💬 Channel",
                value: (message.channel as TextChannel)?.name || message.channelId || "Unknown",
                inline: true,
            },
            { name: "📝 Message ID", value: message.id || "Unknown", inline: true },
            { name: "🕐 Sent At", value: message.createdAt.toUTCString(), inline: true }
        );

    if (message.content) {
        embed.addFields({
            name: "📄 Content",
            value: `\`\`\`${truncate(message.content, 1000)}\`\`\``,
        });
    } else {
        embed.addFields({ name: "📄 Content", value: "*No text content*" });
    }

    if (message.attachments && message.attachments.size > 0) {
        const attachments = message.attachments.map((a) => `[${a.name}](${a.url})`).join("\n");
        embed.addFields({
            name: "📎 Attachments",
            value: truncate(attachments),
        });
    }

    if (message.embeds && message.embeds.length > 0) {
        embed.addFields({
            name: "🖼️ Embeds",
            value: `${message.embeds.length} embed(s) were present`,
        });
    }

    if (jumpUrl) {
        embed.setURL(jumpUrl);
        embed.addFields({ name: "🔗 Jump to Context", value: `[Click here](${jumpUrl})` });
    }

    return embed;
}

export function messageUpdatedEmbed(oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
    const guildId = newMsg.guildId ?? oldMsg.guildId;
    const jumpUrl =
        newMsg.id && guildId ? `https://discord.com/channels/${guildId}/${newMsg.channelId}/${newMsg.id}` : null;

    const embed = baseEmbed("Message Edited", COLORS.message, EMOJIS.message)
        .setAuthor({
            name: newMsg.author?.tag || oldMsg.author?.tag || "Unknown",
            iconURL:
                newMsg.author?.displayAvatarURL({ size: 64 }) || oldMsg.author?.displayAvatarURL({ size: 64 }) || "",
        })
        .addFields(
            { name: "🆔 Author ID", value: `${newMsg.author?.id || oldMsg.author?.id || "Unknown"}`, inline: true },
            {
                name: "💬 Channel",
                value: `${(newMsg.channel as TextChannel)?.name || newMsg.channelId || "Unknown"}`,
                inline: true,
            },
            { name: "📝 Message ID", value: `${newMsg.id || oldMsg.id || "Unknown"}`, inline: true },
            { name: "🕐 Edited At", value: newMsg.editedAt?.toUTCString() || "Now", inline: true }
        );

    if (oldMsg.content || newMsg.content) {
        embed.addFields(
            {
                name: "📄 Before",
                value: oldMsg.content ? `\`\`\`${truncate(oldMsg.content, 500)}\`\`\`` : "*No content*",
            },
            {
                name: "📄 After",
                value: newMsg.content ? `\`\`\`${truncate(newMsg.content, 500)}\`\`\`` : "*No content*",
            }
        );
    }

    if (jumpUrl) {
        embed.setURL(jumpUrl);
        embed.addFields({ name: "🔗 Jump to Message", value: `[Click here](${jumpUrl})` });
    }

    return embed;
}

export async function messageBulkDeletedEmbed(channel: TextChannel, count: number, guild?: Guild) {
    const embed = baseEmbed("Bulk Messages Deleted", COLORS.message, EMOJIS.message)
        .setDescription(`**${count} messages deleted** in #${channel.name}`)
        .addFields(
            { name: "🆔 Channel ID", value: channel.id, inline: true },
            { name: "📂 Type", value: formatChannelType(channel.type), inline: true }
        );

    return addAuditLogField(embed, guild, AuditLogEvent.MessageBulkDelete, channel.id, "👤 Deleted By");
}

// --- VOICE EVENTS GROUP ---
export function voiceStateUpdateEmbed(oldState: VoiceState, newState: VoiceState) {
    const embed = baseEmbed("Voice State Update", COLORS.voice, EMOJIS.voice)
        .setAuthor({
            name: newState.member?.user.tag || "Unknown",
            iconURL: newState.member?.user.displayAvatarURL({ size: 64 }) || "",
        })
        .addFields({ name: "🆔 User ID", value: newState.id, inline: true });

    const changes: string[] = [];

    if (oldState.channelId !== newState.channelId) {
        const oldChannel = oldState.channel ? oldState.channel.name : "None";
        const newChannel = newState.channel ? newState.channel.name : "None";
        changes.push(`**Channel**: ${oldChannel} → **${newChannel}**`);
    }

    if (oldState.serverMute !== newState.serverMute) {
        changes.push(
            `**Server Mute**: ${oldState.serverMute ? "Yes" : "No"} → **${newState.serverMute ? "Yes" : "No"}**`
        );
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
        changes.push(
            `**Server Deaf**: ${oldState.serverDeaf ? "Yes" : "No"} → **${newState.serverDeaf ? "Yes" : "No"}**`
        );
    }

    if (oldState.selfMute !== newState.selfMute) {
        changes.push(`**Self Mute**: ${oldState.selfMute ? "Yes" : "No"} → **${newState.selfMute ? "Yes" : "No"}**`);
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
        changes.push(`**Self Deaf**: ${oldState.selfDeaf ? "Yes" : "No"} → **${newState.selfDeaf ? "Yes" : "No"}**`);
    }

    if (oldState.selfVideo !== newState.selfVideo) {
        changes.push(`**Video**: ${oldState.selfVideo ? "On" : "Off"} → **${newState.selfVideo ? "On" : "Off"}**`);
    }

    if (oldState.streaming !== newState.streaming) {
        changes.push(`**Streaming**: ${oldState.streaming ? "Yes" : "No"} → **${newState.streaming ? "Yes" : "No"}**`);
    }

    if (changes.length > 0) {
        embed.addFields({ name: "🔄 Changes", value: truncate(changes.join("\n")) });
    } else {
        embed.addFields({ name: "🔄 Changes", value: "No visible changes detected" });
    }

    return embed;
}
