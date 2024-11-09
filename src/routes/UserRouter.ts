import express from 'express';

import { UserController } from '../controller/UserController';
import { UserDto } from '../model/User';

export const userRouteur = express.Router();

userRouteur.post("/register", async (req, res) => {
    try {
        const user = req.body as UserDto;
        const userController = new UserController();
        await userController.register(user);
        res.end();

    } catch (e) {
        console.error(e.message);
        res.status(400).end();

    }
})


userRouteur.post('/login', (req, resp) => {
    const user = req.body as UserDto;
    const userController = new UserController();
    let jwt = userController.getJwt(user.login, user.password);

    resp.json({
        token: jwt
    })
})