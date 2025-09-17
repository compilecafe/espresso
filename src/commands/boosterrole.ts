import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, MessageFlags } from "discord.js";
import {
    addUserBoosterRole,
    getBoosterReferenceRole,
    getUserBoosterRole,
    setUserBoosterRole,
} from "~/repositories/booster";

export const data = new SlashCommandBuilder()
    .setName("boosterrole")
    .setDescription("Create or update your custom booster role")
    .addStringOption((opt) => opt.setName("name").setDescription("Role name").setRequired(true))
    .addStringOption((opt) => opt.setName("color").setDescription("Role color (#hex)").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.guild) {
        await interaction.editReply({ content: "This command can only be used in a server." });
        return;
    }

    const member = interaction.member as GuildMember;
    if (!member.premiumSince) {
        await interaction.editReply({ content: "You must be a server booster to use this command." });
        return;
    }

    const name = interaction.options.getString("name", true);
    const colorInput = interaction.options.getString("color", true);

    let color: number;
    if (/^#?[0-9A-F]{6}$/i.test(colorInput)) {
        color = parseInt(colorInput.replace("#", ""), 16);
    } else {
        await interaction.editReply({ content: "Please provide a valid hex color (e.g. #FF00FF)." });
        return;
    }

    const guild = interaction.guild;
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

    const referenceRole = await getBoosterReferenceRole(interaction.guild.id);
    if (referenceRole) {
        const refRole = guild.roles.cache.get(referenceRole);
        if (refRole) {
            await role.setPosition(refRole.position - 1).catch(() => null);
        }
    }

    if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
    }

    await interaction.editReply({
        content: `Your booster role has been ${row ? "updated" : "created"}: <@&${role.id}>`,
    });
}
