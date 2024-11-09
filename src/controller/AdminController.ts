import { DriveController } from "./DriveController";
import { Users } from "../repositories/Users";

const tableUsers = new Users();
export class AdminController {

    async getAllStats(): Promise<{ login: string, stats: {} }[]> {
        const lstUser = tableUsers.getLstUser();

        const lstStats = await Promise.all(
            lstUser.map(async user => {
                return ({
                    login: user.login,
                    stats: await new DriveController().getStats(user.login)
                })
            })
        )

        return lstStats;

    }

    downgradeRole(login: string) {
        if (tableUsers.getUser(login).role === "user") throw new Error("Action impossible")
        tableUsers.downgradeUserRole(login);
    }

    upgradeRole(login: string) {
        if (tableUsers.getUser(login).role === "admin") throw new Error("Action impossible")
        tableUsers.upgradeUserRole(login);
    }

    updateUserQuota(login: string, quota: number) {
        console.log(login)
        if (!tableUsers.isUser(login)) throw new Error("Utilisateur inexistant")
        tableUsers.updateQuota(login, quota);
    }
}