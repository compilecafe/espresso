import { Events, type GuildMember, type PartialGuildMember } from "discord.js";
import { handleBoosterStopped } from "~/services/booster";

export const name = Events.GuildMemberRemove;
export const once = false;

export async function execute(member: GuildMember | PartialGuildMember): Promise<void> {
    if (member.partial) return;
    await handleBoosterStopped(member);
}
