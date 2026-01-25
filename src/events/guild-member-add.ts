import { Events, type GuildMember } from "discord.js";
import { autoAssignRole } from "~/services/auto-role";

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember): Promise<void> {
    await autoAssignRole(member);
}
