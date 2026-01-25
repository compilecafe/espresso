import { Events, type GuildMember } from "discord.js";
import { handleBoosterStopped } from "~/services/booster";

export const name = Events.GuildMemberUpdate;
export const once = false;

export async function execute(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (oldMember.premiumSince && !newMember.premiumSince) {
        await handleBoosterStopped(newMember);
    }
}
