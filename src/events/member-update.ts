import { event } from "~/framework";
import { handleBoosterStopped } from "~/services/booster";

export default event("guildMemberUpdate")
    .execute(async (oldMember, newMember) => {
        if (oldMember.premiumSince && !newMember.premiumSince) {
            await handleBoosterStopped(newMember);
        }
    });
