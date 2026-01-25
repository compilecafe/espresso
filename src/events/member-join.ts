import { event } from "~/framework";
import { autoAssignRole } from "~/services/auto-role";

export default event("guildMemberAdd")
    .execute(async (member) => {
        await autoAssignRole(member);
    });
