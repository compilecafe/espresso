import { command } from "~/framework";

export default command("ping", "Replies with Pong!")
    .execute(async (ctx) => {
        await ctx.reply("Pong!");
    });
