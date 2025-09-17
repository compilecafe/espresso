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
