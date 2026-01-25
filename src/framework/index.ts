export { Barista, type Plugin, type BaristaOptions } from "./core/barista";
export { logger, type Logger } from "./core/logger";
export { container, Container } from "./core/container";

export { command, CommandBuilder, SubcommandBuilder } from "./commands/command-builder";
export { createContext } from "./commands/context";

export { event, EventBuilder } from "./events/event-builder";

export {
    guildOnly,
    boosterOnly,
    adminOnly,
    ownerOnly,
    hasRole,
    hasPermission,
    cooldown,
    nsfw,
} from "./support/guards";

export {
    BaristaError,
    CommandError,
    ValidationError,
    DatabaseError,
    assertDefined,
    assertGuild,
    assertMember,
} from "./support/errors";

export {
    randomInt,
    formatNumber,
    truncate,
    sleep,
    parseHexColor,
    capitalize,
    pluralize,
    formatDuration,
    chunk,
    pick,
    omit,
} from "./support/helpers";

export type {
    CommandContext,
    CommandDefinition,
    CommandHandler,
    CommandOption,
    EventDefinition,
    EventHandler,
    EventName,
    Guard,
    BaristaConfig,
    OptionType,
    AwardXPOptions,
    XPType,
} from "./types";

export { Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";
