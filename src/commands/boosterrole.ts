import { command, guildOnly, boosterOnly, parseHexColor } from "~/framework";
import {
    addUserBoosterRole,
    getBoosterReferenceRole,
    getUserBoosterRole,
    setUserBoosterRole,
} from "~/repositories/booster";

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

        const guild = ctx.guild!;
        const member = ctx.member!;
        const row = await getUserBoosterRole(guild.id, member.id);

        let role;
        if (row) {
            role = guild.roles.cache.get(row.roleId);
            if (!role) {
                role = await guild.roles.create({ name, color, reason: "Booster custom role" });
                await setUserBoosterRole({ roleId: role.id }, row.id);
            } else {
                role = await role.edit({ name, color });
            }
        } else {
            role = await guild.roles.create({ name, color, reason: "Booster custom role" });
            await addUserBoosterRole({ guildId: guild.id, userId: member.id, roleId: role.id });
        }

        const referenceRoleId = await getBoosterReferenceRole(guild.id);
        if (referenceRoleId) {
            const refRole = guild.roles.cache.get(referenceRoleId);
            if (refRole) {
                await role.setPosition(refRole.position - 1).catch(() => null);
            }
        }

        if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }

        await ctx.success(`Your booster role has been ${row ? "updated" : "created"}: <@&${role.id}>`);
    });
