import { Events, GuildMember } from "discord.js";
import { BotClient } from "../client";
import { handleBoosterStopped } from "~/services/booster-service";

export const name = Events.GuildMemberUpdate;
export const once = false;

export async function execute(oldMember: GuildMember, newMember: GuildMember, _: BotClient) {
    if (oldMember.premiumSince && !newMember.premiumSince) {
        await handleBoosterStopped(newMember);
    }
}
