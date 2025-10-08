import { Events, GuildMember } from "discord.js";
import { BotClient } from "../client";
import { handleBoosterStopped } from "~/services/booster-service";

export const name = Events.GuildMemberUpdate;
export const once = false;

export async function execute(member: GuildMember, _: BotClient) {
    await handleBoosterStopped(member);
}
