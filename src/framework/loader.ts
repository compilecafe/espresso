import fs from "fs";
import path from "path";
import type { CommandDefinition, EventDefinition } from "./types";

export async function loadModules<T>(dir: string): Promise<T[]> {
    const modules: T[] = [];

    if (!fs.existsSync(dir)) return modules;

    const traverse = async (currentDir: string) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
                const module = await import(fullPath);
                const exported = module.default ?? module;
                if (exported) modules.push(exported);
            }
        }
    };

    await traverse(dir);
    return modules;
}

export async function loadCommands(dir: string): Promise<CommandDefinition[]> {
    return loadModules<CommandDefinition>(dir);
}

export async function loadEvents(dir: string): Promise<EventDefinition[]> {
    return loadModules<EventDefinition>(dir);
}
