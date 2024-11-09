import { Database } from 'bun:sqlite';
import { userAllDataDto } from "../model/User";

const db = new Database("./db.sqlite3");

export class Users {
    constructor() { }

    async isUserInDatabase(login: string, password: string): Promise<Boolean> {
        const query = db.query("SELECT password FROM USERS WHERE login = ?1");

        type QueryResult = { password: string }[];
        const results = query.all(login) as QueryResult;

        return results.length == 1 && await Bun.password.verify(password, results[0].password);
    }

    isUser(name: string): Boolean {
        const query = db.query("SELECT login FROM users WHERE login = ?1 ");

        type QueryResult = { login: string }[];
        const result = query.all(name) as QueryResult;

        return result.length == 1
    }

    getUser(login: string) {
        const query = db.query("SELECT rowid, * FROM users WHERE login = ?1 ");

        const result = query.all(login) as userAllDataDto[];

        if (result.length != 1) {
            throw new Error("404", { cause: "Utilisateur introuvable" });
        }

        return result[0];
    }

    getLstUser(): userAllDataDto[] {
        const query = db.query("SELECT * FROM users");

        const result = query.all() as userAllDataDto[];

        return result;
    }

    async createUserInDataBase(login: string, password: string): Promise<void> {
        const query = db.query(`INSERT INTO USERS VALUES(?1,?2,"user",1000000)`);

        const result = query.run(login, await Bun.password.hash(password))
        console.log(result);
    }

    downgradeUserRole(login: string): void {
        const query = db.query("UPDATE users SET role='user' WHERE login =?");

        const result = query.run(login);
        console.log(result);

    }
    upgradeUserRole(login: string): void {
        const query = db.query("UPDATE users SET role='admin' WHERE login =?");

        const result = query.run(login);
        console.log(result);

    }
    updateQuota(login: string, quota: number): void {
        const query = db.query("UPDATE users SET quota=?1 WHERE login =?2");

        const result = query.run(quota, login);
        console.log(result);

    }
}

