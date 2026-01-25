import { event, Events } from "~/framework";
import { handleBoosterStopped } from "~/services/booster";

export default event(Events.GuildMemberUpdate)
    .execute(async (oldMember, newMember) => {
        if (oldMember.premiumSince && !newMember.premiumSince) {
            await handleBoosterStopped(newMember);
        }
    });
