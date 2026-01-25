import { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags, type GuildMember, type Role, type TextChannel, type VoiceChannel } from "discord.js";
import type { CommandContext } from "../types";

export function createContext(interaction: ChatInputCommandInteraction, client: Client): CommandContext {
    const ctx: CommandContext = {
        interaction,
        client,
        guild: interaction.guild,
        member: interaction.member as GuildMember | null,
        user: interaction.user,
        channel: interaction.channel as TextChannel | null,

        async reply(content) {
            const payload = typeof content === "string" ? { content } : content;
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(payload);
            } else {
                await interaction.reply(payload);
            }
        },

        async defer(ephemeral = false) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });
            }
        },

        async followUp(content) {
            const payload = typeof content === "string" ? { content } : content;
            await interaction.followUp(payload);
        },

        async embed(builder) {
            const embed = typeof builder === "function" ? builder(new EmbedBuilder()) : builder;
            await ctx.reply({ embeds: [embed] });
        },

        async success(message) {
            await ctx.reply(`✅ ${message}`);
        },

        async error(message) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: `❌ ${message}` });
            } else {
                await interaction.reply({ content: `❌ ${message}`, flags: MessageFlags.Ephemeral });
            }
        },

        async info(message) {
            await ctx.reply(`ℹ️ ${message}`);
        },

        async warn(message) {
            await ctx.reply(`⚠️ ${message}`);
        },

        getString(name, required = false) {
            return interaction.options.getString(name, required);
        },

        getUser(name, required = false) {
            return interaction.options.getUser(name, required);
        },

        getMember(name, _required = false) {
            return interaction.options.getMember(name) as GuildMember | null;
        },

        getNumber(name, required = false) {
            return interaction.options.getNumber(name, required);
        },

        getInteger(name, required = false) {
            return interaction.options.getInteger(name, required);
        },

        getBoolean(name, required = false) {
            return interaction.options.getBoolean(name, required);
        },

        getRole(name, required = false) {
            return interaction.options.getRole(name, required) as Role | null;
        },

        getChannel(name, required = false) {
            return interaction.options.getChannel(name, required) as TextChannel | VoiceChannel | null;
        },

        getAttachment(name, required = false) {
            return interaction.options.getAttachment(name, required);
        },

        getSubcommand() {
            return interaction.options.getSubcommand(false);
        },

        getSubcommandGroup() {
            return interaction.options.getSubcommandGroup(false);
        },
    };

    return ctx;
}
