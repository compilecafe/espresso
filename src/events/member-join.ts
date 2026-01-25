import { event, Events } from "~/framework";
import { autoAssignRole } from "~/services/auto-role";

export default event(Events.GuildMemberAdd)
    .execute(async (member) => {
        await autoAssignRole(member);
    });
