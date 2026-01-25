import { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags, type GuildMember, type Role, type TextChannel, type VoiceChannel } from "discord.js";
import type { CommandContext } from "./types";

export function createContext(interaction: ChatInputCommandInteraction, client: Client): CommandContext {
    return {
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
            await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined });
        },

        async followUp(content) {
            const payload = typeof content === "string" ? { content } : content;
            await interaction.followUp(payload);
        },

        async embed(builder: EmbedBuilder | ((embed: EmbedBuilder) => EmbedBuilder)) {
            const embed = typeof builder === "function" ? builder(new EmbedBuilder()) : builder;
            await this.reply({ embeds: [embed] });
        },

        async success(message: string) {
            await this.reply(`✅ ${message}`);
        },

        async error(message: string) {
            await this.reply({ content: `❌ ${message}`, flags: MessageFlags.Ephemeral });
        },

        getString(name, required = false) {
            return interaction.options.getString(name, required);
        },

        getUser(name, required = false) {
            return interaction.options.getUser(name, required);
        },

        getNumber(name, required = false) {
            return interaction.options.getNumber(name, required);
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

        getSubcommand() {
            return interaction.options.getSubcommand(false);
        },
    };
}
