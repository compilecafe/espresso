import { command, guildOnly, boosterOnly, parseHexColor } from "~/framework";
import { BoosterService } from "~/app/services/booster-service";

export default command("boosterrole", "Create or update your custom booster role")
    .string("name", "Role name", true)
    .string("color", "Role color (#hex)", true)
    .guard(guildOnly, boosterOnly)
    .execute(async (ctx) => {
        await ctx.defer(true);

        const name = ctx.getString("name", true)!;
        const colorInput = ctx.getString("color", true)!;
        const color = parseHexColor(colorInput);

        if (color === null) {
            await ctx.error("Please provide a valid hex color (e.g. #FF00FF).");
            return;
        }

        const { role, isNew } = await BoosterService.createOrUpdateRole(ctx.member!, name, color);
        await ctx.success(`Your booster role has been ${isNew ? "created" : "updated"}: <@&${(role as { id: string }).id}>`);
    });
