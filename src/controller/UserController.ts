import { JWT_SECRET } from "../config/constants";
import { UserDto } from "../model/User";
import { Users } from "../repositories/Users";
import fs from 'fs/promises'
import jwt from 'jsonwebtoken';

const tableUsers = new Users();
export class UserController {

    async register(user: UserDto) {

        await tableUsers.createUserInDataBase(user.login, user.password)
        await fs.mkdir(`./drive/${user.login}/`)
        console.log("Utilisateur crée", user.login)
    }

    getJwt(login: string, password: string): string {
        if (!tableUsers.isUserInDatabase(login, password)) throw new Error("Error not find");

        return jwt.sign({ name: login }, JWT_SECRET);

    }
}