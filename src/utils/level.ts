import type { SelectLevelingSetting, SelectLevelingUserLevel } from "~/database/schema";
import type { AwardXPOptions } from "~/services/leveling-service";

const xpCooldowns: Map<string, number> = new Map();

export function getLevelFromXP(xp: number): number {
    let level = 0;
    let neededXP = 100;
    while (xp >= neededXP) {
        level++;
        neededXP += 5 * level * level + 50 * level + 100;
    }
    return level;
}

export function getXPForLevel(level: number): number {
    let xp = 0;
    for (let i = 1; i <= level; i++) {
        xp += 5 * i * i + 50 * i + 100;
    }
    return xp;
}

export function updateXP(userRow: SelectLevelingUserLevel | null, type: "text" | "voice", xpGained: number) {
    let newTextXp = userRow?.textXp ?? 0;
    let newVoiceXp = userRow?.voiceXp ?? 0;

    if (type === "text") newTextXp += xpGained;
    else newVoiceXp += xpGained;

    const totalXP = newTextXp + newVoiceXp;
    const currentLevel = userRow?.level ?? 0;
    const newLevel = getLevelFromXP(totalXP);

    return {
        newTextXp,
        newVoiceXp,
        newLevel,
        leveledUp: newLevel > currentLevel,
    };
}

export function canGainXP(guildId: string, userId: string, cooldownMs: number): boolean {
    const key = `${guildId}:${userId}`;
    const last = xpCooldowns.get(key) ?? 0;
    if (Date.now() - last < cooldownMs) return false;
    xpCooldowns.set(key, Date.now());
    return true;
}

export function calculateXP(options: AwardXPOptions, setting: SelectLevelingSetting): number {
    let minXP: number;
    let maxXP: number;

    if (options.type === "text") {
        minXP = setting.levelingMinXpText;
        maxXP = setting.levelingMaxXpText;
    } else {
        minXP = options.duration * setting.levelingMinXpVoice;
        maxXP = options.duration * setting.levelingMaxXpVoice;
    }

    return Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;
}
