import type { Guard } from "../types";

export const guildOnly: Guard = async (ctx) => {
    if (!ctx.guild) return "This command can only be used in a server.";
    return true;
};

export const boosterOnly: Guard = async (ctx) => {
    if (!ctx.member?.premiumSince) return "You must be a server booster to use this command.";
    return true;
};

export const adminOnly: Guard = async (ctx) => {
    if (!ctx.member?.permissions.has("Administrator")) return "You need administrator permissions.";
    return true;
};

export const ownerOnly = (ownerId: string): Guard => async (ctx) => {
    if (ctx.user.id !== ownerId) return "This command can only be used by the bot owner.";
    return true;
};

export const hasRole = (roleId: string): Guard => async (ctx) => {
    if (!ctx.member?.roles.cache.has(roleId)) return "You don't have the required role.";
    return true;
};

export const hasPermission = (permission: bigint): Guard => async (ctx) => {
    if (!ctx.member?.permissions.has(permission)) return "You don't have the required permissions.";
    return true;
};

export const cooldown = (ms: number): Guard => {
    const cooldowns = new Map<string, number>();
    return async (ctx) => {
        const key = `${ctx.user.id}:${ctx.interaction.commandName}`;
        const last = cooldowns.get(key) ?? 0;
        const remaining = ms - (Date.now() - last);
        if (remaining > 0) {
            return `Please wait ${Math.ceil(remaining / 1000)} seconds before using this command again.`;
        }
        cooldowns.set(key, Date.now());
        return true;
    };
};

export const nsfw: Guard = async (ctx) => {
    if (!ctx.channel || !("nsfw" in ctx.channel) || !ctx.channel.nsfw) {
        return "This command can only be used in NSFW channels.";
    }
    return true;
};
