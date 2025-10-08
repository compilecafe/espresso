// src/events/guildMemberAdd.ts
import { Events, GuildMember } from "discord.js";
import { BotClient } from "../client";
import { autoAssignRole } from "~/services/auto-role-services";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember, _: BotClient) {
    await autoAssignRole(member);
}
