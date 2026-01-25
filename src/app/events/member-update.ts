import { event, Events } from "~/framework";
import { BoosterService } from "~/app/services/booster-service";

export default event(Events.GuildMemberUpdate)
    .execute(async (oldMember, newMember) => {
        if (oldMember.premiumSince && !newMember.premiumSince) {
            await BoosterService.removeRole(newMember);
        }
    });
