# Espresso ☕

A multi-purpose Discord bot made by the [Compile Café](https://discord.gg/ExCvJtVTu6) community, powered by the **Barista** framework.

## Barista Framework

Espresso uses **Barista**, a custom Discord.js wrapper that makes bot development intuitive and enjoyable.

### Features

- **Fluent Builder API** - Chain methods to define commands and events
- **Auto-Discovery** - Commands and events are automatically loaded from directories
- **Built-in Guards** - Permission checks like `guildOnly`, `boosterOnly`, `adminOnly`
- **Subcommand Support** - Define complex commands with nested subcommands
- **Plugin System** - Extend functionality with reusable plugins
- **Rich Context** - Helper methods like `ctx.success()`, `ctx.error()`, `ctx.embed()`
- **Type-Safe** - Full TypeScript support with strict types

### Quick Start

```typescript
// src/index.ts
import "dotenv/config";
import path from "path";
import { Barista } from "~/framework";
import { env } from "~/utils/env";

const bot = Barista.create({
    token: env.DISCORD_TOKEN,
    clientId: env.CLIENT_ID,
    intents: [
        Barista.intents.guilds,
        Barista.intents.messages,
        Barista.intents.members,
        Barista.intents.voice,
    ],
})
    .withCommands(path.join(__dirname, "commands"))
    .withEvents(path.join(__dirname, "events"));

await bot.start();
```

### Creating Commands

```typescript
// Simple command
import { command } from "~/framework";

export default command("ping", "Replies with Pong!")
    .execute(async (ctx) => {
        await ctx.reply("Pong!");
    });
```

```typescript
// Command with options and guards
import { command, guildOnly } from "~/framework";

export default command("level", "Check your level")
    .user("user", "The user to check")
    .guard(guildOnly)
    .execute(async (ctx) => {
        const user = ctx.getUser("user") ?? ctx.user;
        await ctx.success(`Checking level for ${user.username}`);
    });
```

```typescript
// Command with subcommands
import { command, adminOnly } from "~/framework";

export default command("settings", "Configure bot settings")
    .guard(adminOnly)
    .subcommand("leveling", "Leveling settings", (sub) =>
        sub
            .channel("channel", "Notification channel")
            .boolean("enabled", "Enable notifications")
            .execute(async (ctx) => {
                await ctx.success("Leveling settings updated!");
            })
    )
    .subcommand("autorole", "Auto-role settings", (sub) =>
        sub
            .role("role", "Role to assign")
            .execute(async (ctx) => {
                await ctx.success("Auto-role configured!");
            })
    );
```

### Creating Events

```typescript
// Simple event
import { event } from "~/framework";

export default event("ready")
    .runOnce()
    .execute(async (client) => {
        console.log(`Logged in as ${client.user?.tag}`);
    });
```

```typescript
// Message event
import { event } from "~/framework";

export default event("messageCreate")
    .execute(async (message, client) => {
        if (message.content === "hello") {
            await message.reply("Hello!");
        }
    });
```

### Command Context

The `CommandContext` provides helpful methods:

| Method | Description |
|--------|-------------|
| `ctx.reply(content)` | Reply to the interaction |
| `ctx.defer(ephemeral?)` | Defer the reply |
| `ctx.followUp(content)` | Send a follow-up message |
| `ctx.success(message)` | Reply with ✅ prefix |
| `ctx.error(message)` | Reply with ❌ prefix (ephemeral) |
| `ctx.embed(builder)` | Reply with an embed |
| `ctx.getString(name)` | Get string option value |
| `ctx.getUser(name)` | Get user option value |
| `ctx.getNumber(name)` | Get number option value |
| `ctx.getBoolean(name)` | Get boolean option value |
| `ctx.getRole(name)` | Get role option value |
| `ctx.getChannel(name)` | Get channel option value |
| `ctx.getSubcommand()` | Get current subcommand name |

### Built-in Guards

```typescript
import { guildOnly, boosterOnly, adminOnly, hasRole, cooldown } from "~/framework";

command("example", "Example command")
    .guard(guildOnly)                    // Must be used in a server
    .guard(boosterOnly)                  // Must be a server booster
    .guard(adminOnly)                    // Must have administrator permission
    .guard(hasRole("123456789"))         // Must have specific role
    .guard(cooldown(5000))               // 5 second cooldown
    .execute(async (ctx) => { ... });
```

### Plugin System

```typescript
import { Barista, type Plugin } from "~/framework";

const loggingPlugin: Plugin = {
    name: "logging",
    setup: (barista) => {
        barista.onError((error, commandName) => {
            console.error(`Error in ${commandName}:`, error);
        });
    },
};

Barista.create({ ... })
    .use(loggingPlugin)
    .start();
```

### Utilities

```typescript
import { parseHexColor, randomInt, formatNumber, truncate, sleep } from "~/framework";

parseHexColor("#FF00FF");     // 16711935
randomInt(1, 100);            // Random number 1-100
formatNumber(1234567);        // "1,234,567"
truncate("Long text...", 10); // "Long te..."
await sleep(1000);            // Wait 1 second
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/compilecafe/espresso.git
cd espresso
```

### 2. Copy environment file

```bash
cp .env.example .env
```

Edit `.env` with your Discord bot token and client ID.

### 3. Run the bot

**Using Docker (recommended)**

```bash
docker compose up --build -d
```

**Without Docker**

```bash
bun install
bun start
```

## Project Structure

```
src/
├── framework/          # Barista framework
│   ├── bot.ts          # Main bot class
│   ├── command.ts      # Command builder
│   ├── event.ts        # Event builder
│   ├── guards.ts       # Permission guards
│   ├── context.ts      # Command context
│   ├── container.ts    # Dependency injection
│   ├── errors.ts       # Error utilities
│   ├── middleware.ts   # Middleware support
│   ├── loader.ts       # Auto-discovery
│   ├── utils.ts        # Utilities
│   └── types.ts        # TypeScript types
├── commands/           # Slash commands
├── events/             # Event handlers
├── services/           # Business logic
├── repositories/       # Database access
├── database/           # Database schema
└── index.ts            # Entry point
```

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## License

MIT License
