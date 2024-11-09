import { Item } from "../model/Item";
import fs from 'fs/promises';
import { FichierInfo } from "../model/FichierInfo";
import { Users } from "../repositories/Users";
import { UserShares } from "../repositories/UserShares";

const tableUserShare = new UserShares();
const tableUsers = new Users();
export class DriveController {


    #getDrivePath(login: string, path: string): string {
        return `./drive/${login}/${path}`;
    }

    generateSimulatedData() {
        return [
            { name: "anime.txt", isFile: true },
            { name: "courses.txt", isFile: true },
            { name: "souvenirs", isFile: false },
        ];
    }

    async listItemByPath(login: string, path: string): Promise<Item[]> {

        const items: Item[] = [];
        const dir = await fs.opendir(`./drive/${login}/${path}`);

        for await (const file of dir) {
            items.push({ name: file.name, isFiLe: file.isFile() });
        }

        return items;
    }

    async listItemByUser(login: string): Promise<Item[]> {
        const dir = await fs.readdir(`./drive/${login}/`, { withFileTypes: true, recursive: true });
        const lstItem = dir.map((elm) => {
            return { name: elm.name, isFiLe: elm.isFile(), path: elm.parentPath + "\\" + elm.name }
        })

        return lstItem;
    }

    async getInfo(login: string, path: string): Promise<FichierInfo> {
        const file = await fs.stat(`./drive/${login}/${path}`);
        const name = path.split("/").pop();

        return new FichierInfo(file.size, path, name, file.isDirectory());

    }

    async getFileContent(login: string, path: string): Promise<string> {

        return await fs.readFile(`./drive/${login}/${path}`, {
            encoding: "utf8",
        });
    }

    async getFileContainingInName(login: string, path: string, param: string) {
        const lstItem = await this.listItemByUser(login);

        return lstItem.filter((item) => item.name.match(param));
    }

    async getFileContaining(login: string, path: string, param: string): Promise<Item[]> {
        const lstItem = await this.listItemByUser(login);
        const lstFile = lstItem.filter(item => item.isFiLe && typeof item.path === 'string');

        const lstItemValide = await Promise.all(
            lstFile.map(async item => {
                const path = String(item.path).replace(`drive\\${login}\\`, "");
                const contenu = await this.getFileContent(login, path);
                return contenu.match(param) ? item : null;
            })
        )
        const result = lstItemValide.filter(item => item !== null)

        if (result.length < 1) {
            throw new Error("404", { cause: "Aucun fichier trouvé" });
        }

        return result;
    }

    async getStats(login: string) {
        const lstItem = await this.listItemByUser(login);
        const user = tableUsers.getUser(login);

        const quota = user.quota;
        let lstFile = lstItem.filter(item => item.isFiLe);
        let nbDir = lstItem.length - lstFile.length;
        const fileSize = await Promise.all(
            lstItem
                .filter(item => typeof item.path === 'string')
                .map(item => fs.stat(String(item.path)).then(stats => stats.size))
        )
        const drive_size = fileSize.reduce((total, size) => total + size, 0);

        const stats = { files: lstFile.length, folders: nbDir, size: drive_size, quota: quota };
        return (stats)

    }

    async getMyShares(id: number) {
        return await tableUserShare.getSharedByOwnerId(id)
    }
    async getSharedFiles(id: number) {
        return await tableUserShare.getSharedWith(id)
    }


    async setTextFileContent(login: string, filePath: string, content: any): Promise<void> {
        const path = this.#getDrivePath(login, filePath);
        await fs.writeFile(path, content);

        const newFileStats = await fs.stat(path);
        const userStats = await this.getStats(login);
        if (userStats.size + newFileStats.size > userStats.quota) {
            fs.unlink(path);
            throw new Error("401", { cause: "Limite d'epace atteinte" });
        }
    }

    async setRasenganToBold(login: string, path: string) {
        path = path.replace("/markdown", "");
        let content = await this.getFileContent(login, path);
        content = content.replaceAll("rasengan", "**rasengan**");
        await fs.writeFile(this.#getDrivePath(login, path), content);
    }

    async shareFileTo(filePath: string, login: string, to_login: string) {
        const user1 = tableUsers.getUser(login);
        const user2 = tableUsers.getUser(to_login);

        //await this.copyFileToUser(login, filePath, to_login);
        await tableUserShare.addSharedFile(user1.rowid, user2.rowid, filePath);
    }

    async copyFileTo(source: string, destination: string): Promise<void> {
        if (!(await fs.exists(source))) throw new Error("Fichier source inexistant");

        const loginCible = destination.split('/')[1];
        const userStats = await this.getStats(loginCible);
        const fileStats = await fs.stat(source);

        if (userStats.quota >= fileStats.size + userStats.size)
            await fs.cp(source, destination, { recursive: true });
        else throw new Error("Stockage insufisant");
    }

    async copyFileToUser(login: string, fichier: string, to_login: string) {
        if (!tableUsers.isUser(to_login)) throw new Error("404", { cause: "utilisateur introuvable" });
        else if (to_login === login) throw new Error("401", { cause: "Envoi non autorisé" });
        else {
            const source = this.#getDrivePath(login, fichier);
            const destination = this.#getDrivePath(to_login, fichier)
            if (!(await fs.exists(source))) {
                throw new Error("404", { cause: "Fichier introuvable" });
            } else {

                const userStats = await this.getStats(to_login);
                const fileStats = await fs.stat(source);
                if (userStats.quota >= fileStats.size + userStats.size) {
                    await fs.cp(source, destination, { recursive: true });

                }
            }
        }
    }

    async moveFileTo(source: string, destination: string) {
        let pathDestination = './drive/' + destination;
        const filename = source.split("/").pop() as string;

        if (await fs.exists(pathDestination)) {
            const statsDestination = await fs.stat(pathDestination);
            if (statsDestination.isDirectory()) pathDestination = pathDestination + "/" + filename;
        }

        await fs.cp(source, pathDestination, { recursive: true });
        await fs.unlink(source);

    }

    async deleteFile(login: string, path: string): Promise<void> {

        if ((await this.getInfo(login, path)).isDirectory) {
            await fs.rm(this.#getDrivePath(login, path), { recursive: true, force: true });
        }
        else await fs.unlink(this.#getDrivePath(login, path));
    }

    async removeShareFile(id: number, filePath: string, target: string | undefined) {
        console.log("eee50")
        let target_id;

        if (target) {
            const target_user = tableUsers.getUser(target);
            target_id = target_user.rowid;
        } else {
            target_id = undefined;
        }

        await tableUserShare.deleteShare(id, filePath, target_id);

    }

}