import { event, Events } from "~/framework";
import { handleBoosterStopped } from "~/services/booster";

export default event(Events.GuildMemberRemove)
    .execute(async (member) => {
        if (member.partial) return;
        await handleBoosterStopped(member);
    });
