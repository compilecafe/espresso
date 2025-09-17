import { BotClient, type SlashCommand } from "~/client";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { env } from "~/utils/env";

export async function loadCommands(client: BotClient): Promise<void> {
    const commandsJSON: unknown[] = [];
    const commandsPath = path.join(__dirname, "../commands");

    const traverse = async (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.name.endsWith(".ts")) {
                const commandModule = (await import(fullPath)) as SlashCommand;
                client.commands.set(commandModule.data.name, commandModule);
                commandsJSON.push(commandModule.data.toJSON());
            }
        }
    };

    await traverse(commandsPath);

    const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN!);
    await rest.put(Routes.applicationCommands(env.CLIENT_ID!), { body: commandsJSON });

    console.log(`Loaded ${client.commands.size} commands.`);
}
