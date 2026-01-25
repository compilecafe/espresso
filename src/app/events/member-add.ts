import { event, Events } from "~/framework";
import { AutoRoleService } from "~/app/services/auto-role-service";

export default event(Events.GuildMemberAdd)
    .execute(async (member) => {
        await AutoRoleService.assignRole(member);
    });
