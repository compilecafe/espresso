export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatNumber(n: number): string {
    return n.toLocaleString();
}

export function truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length - 3) + "..." : str;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseHexColor(input: string): number | null {
    if (!/^#?[0-9A-F]{6}$/i.test(input)) return null;
    return parseInt(input.replace("#", ""), 16);
}
