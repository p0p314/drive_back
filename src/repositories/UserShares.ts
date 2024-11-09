import { Database } from 'bun:sqlite';
import { ItemSharedDto, ItemUserShared, ItemUserShares } from '../model/Item';

const db = new Database("./db.sqlite3");

export class UserShares {
    constructor() { }

    async addSharedFile(id_user1: number, id_user2: number, file: string) {
        const query = db.query(`INSERT INTO UserShares VALUES(?1,?2, ?3)`);
        console.log(query.run(id_user1, id_user2, file));

    }

    async getSharedByOwnerId(id: number): Promise<ItemUserShares[]> {
        const query = db.query(`
            SELECT UserShares.*, USERS.login FROM UserShares 
            INNER JOIN USERS on USERS.rowid = UserShares.sharedto_rowid
            WHERE owner_rowid=?1`);

        const result = query.all(id) as ItemSharedDto[];
        if (result.length >= 1) {
            return result.map((item) => ({
                target: item.login,
                path: item.owner_file_path
            }));
        }
        else {
            throw new Error("404", { cause: "Aucun élément trouvé pour l'id :" + id })
        }
    }
    async getSharedWith(id: number): Promise<ItemUserShared[]> {
        const query = db.query(`
                SELECT UserShares.*, USERS.login FROM UserShares 
                INNER JOIN USERS on USERS.rowid = UserShares.owner_rowid
                WHERE sharedto_rowid=?1`);

        const result = query.all(id) as ItemSharedDto[];
        if (result.length >= 1) {
            return result.map((item) => ({
                owner: item.login,
                path: item.owner_file_path
            }));
        }
        else {
            throw new Error("404", { cause: "Aucun élément trouvé pour l'id :" + id })
        }
    }

    async as_access(id_owner: number, id: number, filePath: string): Promise<boolean> {
        const query = db.query(`
                    SELECT UserShares.*, USERS.login FROM UserShares 
                    INNER JOIN USERS on USERS.rowid = UserShares.owner_rowid
                    WHERE owner_rowid=?1 AND sharedto_rowid=?2 AND  owner_file_path=?3
                    `);

        const result = query.get(id_owner, id, filePath) as ItemSharedDto;


        if (!result) throw new Error("403", { cause: "Fichier inacessible" });
        else return true;
    }

    async deleteShare(id: number, filePath: string, target: number | undefined) {
        let result;
        if (target) {
            const query = db.query(` DELETE FROM UserShares WHERE owner_rowid=?1 AND sharedto_rowid=?2 AND  owner_file_path=?3`)
            result = query.run(id, target, filePath);
        }
        else {
            const query = db.query(` DELETE FROM UserShares WHERE owner_rowid=?1 AND owner_file_path=?2`)
            result = query.run(id, filePath);
        }
        console.log(result);
        if (!result) {
            throw new Error('404', { cause: "Partage introuvable" });
        }
    }

}