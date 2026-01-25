# Espresso ☕

A multi-purpose Discord bot made by the [Compile Café](https://discord.gg/ExCvJtVTu6) community, powered by the **Barista** framework.

## Barista Framework

Barista is an opinionated, batteries-included Discord.js wrapper. It provides a clean, intuitive API for building Discord bots with minimal boilerplate.

### Features

- **🏗️ Structure** - Organized `app/`, `config/`, `database/` directories
- **⚡ Fluent Command Builder** - Chain methods to define commands intuitively
- **📡 Event System** - Simple event handlers with Discord.js Events enum
- **🛡️ Built-in Guards** - Permission checks like `guildOnly`, `adminOnly`, `cooldown`
- **💉 Dependency Injection** - Service container for managing dependencies
- **🔌 Plugin System** - Extend functionality with reusable plugins
- **📝 Beautiful Logging** - Colorful console output
- **🎯 Type-Safe** - Full TypeScript support with strict types
- **🔧 Zero Config** - Auto-discovery of commands and events

## Quick Start

```typescript
// src/index.ts
import "dotenv/config";
import { createApp } from "./bootstrap";

const app = createApp();
await app.start();
```

```typescript
// src/bootstrap.ts
import { Barista } from "~/framework";
import { config } from "~/config/bot";
import path from "path";

export function createApp(): Barista {
    return Barista.create({
        token: config.DISCORD_TOKEN,
        clientId: config.CLIENT_ID,
        debug: config.DEBUG,
        intents: [
            Barista.intents.guilds,
            Barista.intents.messages,
            Barista.intents.members,
            Barista.intents.voice,
        ],
    })
        .commands(path.join(__dirname, "app/commands"))
        .events(path.join(__dirname, "app/events"));
}
```

## Project Structure

```
src/
├── app/                          # Application code
│   ├── commands/                 # Slash commands
│   │   ├── ping.ts
│   │   ├── level.ts
│   │   ├── boosterrole.ts
│   │   └── settings.ts
│   ├── events/                   # Event handlers
│   │   ├── ready.ts
│   │   ├── guild-create.ts
│   │   ├── member-add.ts
│   │   ├── member-remove.ts
│   │   ├── member-update.ts
│   │   ├── message-create.ts
│   │   └── voice-state-update.ts
│   ├── services/                 # Business logic
│   │   ├── leveling-service.ts
│   │   ├── booster-service.ts
│   │   └── auto-role-service.ts
│   └── repositories/             # Data access
│       ├── guild-repository.ts
│       ├── leveling-repository.ts
│       └── booster-repository.ts
├── config/                       # Configuration
│   ├── bot.ts                    # Bot settings
│   └── database.ts               # Database connection
├── database/                     # Database layer
│   └── schema/                   # Drizzle schema
│       └── schema.ts
├── framework/                    # Barista framework
│   ├── core/                     # Core classes
│   │   ├── barista.ts            # Main bot class
│   │   ├── container.ts          # DI container
│   │   ├── loader.ts             # Auto-discovery
│   │   └── logger.ts             # Logging utility
│   ├── commands/                 # Command system
│   │   ├── command-builder.ts    # Fluent builder
│   │   └── context.ts            # Command context
│   ├── events/                   # Event system
│   │   └── event-builder.ts      # Event builder
│   ├── support/                  # Utilities
│   │   ├── guards.ts             # Permission guards
│   │   ├── errors.ts             # Error classes
│   │   └── helpers.ts            # Helper functions
│   ├── types.ts                  # TypeScript types
│   └── index.ts                  # Barrel exports
├── bootstrap.ts                  # App bootstrap
└── index.ts                      # Entry point
```

## Creating Commands

```typescript
// Simple command
import { command } from "~/framework";

export default command("ping", "Check if the bot is responsive").execute(
  async (ctx) => {
    await ctx.success(`Pong! Latency: ${ctx.client.ws.ping}ms`);
  }
);
```

```typescript
// Command with options and guards
import { command, guildOnly, EmbedBuilder } from "~/framework";

export default command("level", "Check your level")
  .user("user", "The user to check")
  .guard(guildOnly)
  .execute(async (ctx) => {
    await ctx.defer();
    const target = ctx.getUser("user") ?? ctx.user;

    await ctx.embed(
      new EmbedBuilder()
        .setTitle(`${target.username}'s Level`)
        .setDescription("Level 10")
    );
  });
```

```typescript
// Command with subcommands
import { command, adminOnly, guildOnly } from "~/framework";

export default command("settings", "Configure bot settings")
  .guard(guildOnly, adminOnly)
  .subcommand("leveling", "Configure leveling", (sub) =>
    sub
      .channel("channel", "Notification channel")
      .boolean("enabled", "Enable notifications")
      .execute(async (ctx) => {
        await ctx.success("Settings updated!");
      })
  )
  .subcommand("autorole", "Configure auto-role", (sub) =>
    sub.role("role", "Role to assign").execute(async (ctx) => {
      await ctx.success("Auto-role configured!");
    })
  );
```

## Creating Events

```typescript
import { event, Events, logger } from "~/framework";

export default event(Events.ClientReady)
  .runOnce()
  .execute(async (client) => {
    logger.success(`Logged in as ${client.user.tag}`);
  });
```

```typescript
import { event, Events } from "~/framework";

export default event(Events.MessageCreate).execute(async (message, client) => {
  if (message.content === "!hello") {
    await message.reply("Hello!");
  }
});
```

## Command Context

| Method                    | Description                  |
| ------------------------- | ---------------------------- |
| `ctx.reply(content)`      | Reply to interaction         |
| `ctx.defer(ephemeral?)`   | Defer the reply              |
| `ctx.success(message)`    | Reply with success message   |
| `ctx.error(message)`      | Reply with error (ephemeral) |
| `ctx.info(message)`       | Reply with info message      |
| `ctx.warn(message)`       | Reply with warning message   |
| `ctx.embed(builder)`      | Reply with embed             |
| `ctx.getString(name)`     | Get string option            |
| `ctx.getUser(name)`       | Get user option              |
| `ctx.getMember(name)`     | Get member option            |
| `ctx.getNumber(name)`     | Get number option            |
| `ctx.getInteger(name)`    | Get integer option           |
| `ctx.getBoolean(name)`    | Get boolean option           |
| `ctx.getRole(name)`       | Get role option              |
| `ctx.getChannel(name)`    | Get channel option           |
| `ctx.getAttachment(name)` | Get attachment option        |
| `ctx.getSubcommand()`     | Get subcommand name          |

## Built-in Guards

```typescript
import {
    guildOnly,      // Must be in a server
    adminOnly,      // Must be administrator
    boosterOnly,    // Must be server booster
    ownerOnly,      // Must be bot owner
    hasRole,        // Must have specific role
    hasPermission,  // Must have permission
    cooldown,       // Rate limiting
    nsfw,           // NSFW channel only
} from "~/framework";

command("example", "Example")
    .guard(guildOnly)
    .guard(adminOnly)
    .guard(cooldown(5000))  // 5 second cooldown
    .execute(async (ctx) => { ... });
```

## Logger

```typescript
import { logger } from "~/framework";

logger.info("Information message");
logger.success("Success message");
logger.warn("Warning message");
logger.error("Error message");
logger.debug("Debug message");
logger.ready("Bot is ready!");
logger.command("ping");
logger.event("messageCreate");
logger.database("Connected to database");
logger.box("Title", "Message in a box");
```

## Helper Functions

```typescript
import {
  randomInt, // Random integer between min and max
  formatNumber, // Format number with commas
  truncate, // Truncate string with ellipsis
  sleep, // Async sleep
  parseHexColor, // Parse hex color to number
  capitalize, // Capitalize first letter
  pluralize, // Pluralize word
  formatDuration, // Format milliseconds to human readable
  chunk, // Split array into chunks
  pick, // Pick keys from object
  omit, // Omit keys from object
} from "~/framework";
```

## Plugin System

```typescript
import { Barista, type Plugin, logger } from "~/framework";

const analyticsPlugin: Plugin = {
    name: "analytics",
    version: "1.0.0",
    setup: (barista) => {
        barista.onError((error, command) => {
            // Send to analytics service
        });
    },
};

Barista.create({ ... })
    .use(analyticsPlugin)
    .start();
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/compilecafe/espresso.git
cd espresso
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
DATABASE_URL=postgres://...
DEBUG=false
```

### 4. Run database migrations

```bash
bun run db:push
```

### 5. Start the bot

```bash
bun start
```

## Docker

```bash
docker compose up --build -d
```

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## License

MIT License
