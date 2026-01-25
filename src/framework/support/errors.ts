export class BaristaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BaristaError";
    }
}

export class CommandError extends BaristaError {
    public ephemeral: boolean;

    constructor(message: string, ephemeral = true) {
        super(message);
        this.name = "CommandError";
        this.ephemeral = ephemeral;
    }
}

export class ValidationError extends BaristaError {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class DatabaseError extends BaristaError {
    constructor(message: string) {
        super(message);
        this.name = "DatabaseError";
    }
}

export function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
    if (value === null || value === undefined) {
        throw new CommandError(message);
    }
}

export function assertGuild(ctx: { guild: unknown }): asserts ctx is { guild: NonNullable<typeof ctx.guild> } {
    if (!ctx.guild) throw new CommandError("This command can only be used in a server.");
}

export function assertMember(ctx: { member: unknown }): asserts ctx is { member: NonNullable<typeof ctx.member> } {
    if (!ctx.member) throw new CommandError("Could not resolve member.");
}
