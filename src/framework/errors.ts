export class CommandError extends Error {
    public ephemeral: boolean;

    constructor(message: string, ephemeral = true) {
        super(message);
        this.name = "CommandError";
        this.ephemeral = ephemeral;
    }
}

export function assertGuild(ctx: { guild: unknown }): asserts ctx is { guild: NonNullable<typeof ctx.guild> } {
    if (!ctx.guild) throw new CommandError("This command can only be used in a server.");
}

export function assertMember(ctx: { member: unknown }): asserts ctx is { member: NonNullable<typeof ctx.member> } {
    if (!ctx.member) throw new CommandError("Could not resolve member.");
}
