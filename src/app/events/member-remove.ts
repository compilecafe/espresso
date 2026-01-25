import { event, Events } from "~/framework";
import { BoosterService } from "~/app/services/booster-service";

export default event(Events.GuildMemberRemove)
    .execute(async (member) => {
        if (member.partial) return;
        await BoosterService.removeRole(member);
    });
