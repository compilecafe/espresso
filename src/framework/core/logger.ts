import { createConsola } from "consola";
import * as pc from "picocolors";

const consola = createConsola({
    formatOptions: {
        date: true,
        colors: true,
        compact: false,
    },
});

export const logger = {
    info: (message: string, ...args: unknown[]) => consola.info(message, ...args),
    success: (message: string, ...args: unknown[]) => consola.success(message, ...args),
    warn: (message: string, ...args: unknown[]) => consola.warn(message, ...args),
    error: (message: string, ...args: unknown[]) => consola.error(message, ...args),
    debug: (message: string, ...args: unknown[]) => consola.debug(message, ...args),
    ready: (message: string) => consola.success(message),
    command: (name: string) => consola.info(`Command loaded: ${pc.bold(name)}`),
    event: (name: string) => consola.info(`Event loaded: ${pc.bold(name)}`),
    database: (message: string) => consola.info(message),
    box: (title: string, message: string) => consola.box({ title, message, style: { borderColor: "magenta" } }),
};

export type Logger = typeof logger;
