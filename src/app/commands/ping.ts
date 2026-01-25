import { command } from "~/framework";

export default command("ping", "Check if the bot is responsive")
    .execute(async (ctx) => {
        const latency = ctx.client.ws.ping;
        await ctx.success(`Pong! Latency: ${latency}ms`);
    });
