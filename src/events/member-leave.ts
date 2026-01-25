import { event } from "~/framework";
import { handleBoosterStopped } from "~/services/booster";

export default event("guildMemberRemove")
    .execute(async (member) => {
        if (member.partial) return;
        await handleBoosterStopped(member);
    });
