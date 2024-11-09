import express from 'express';

import { AdminController } from '../controller/AdminController';

export const adminRouteur = express.Router();

adminRouteur.get("/stats", async (req, res) => {
    try {

        let lstStats = await new AdminController().getAllStats()
        res.json(lstStats)
    } catch (e) {
        console.error(e);
    }
})

adminRouteur.post("/downgrade/:login", async (req, res) => {
    try {
        const userLogin = req.params.login;
        new AdminController().downgradeRole(userLogin);
    } catch (e) {
        console.log(e.message);
        res.status(200).end();
    }
})

adminRouteur.post("/upgrade/:login", async (req, res) => {
    try {
        const userLogin = req.params.login;
        new AdminController().upgradeRole(userLogin);
    } catch (e) {
        console.log(e.message);
        res.status(200).end();
    }
})

adminRouteur.post("/quota/:login/:quota", async (req, res) => {
    try {
        const login = req.params.login;
        const quota = Number(req.params.quota);
        new AdminController().updateUserQuota(login, quota);
    } catch (e) {
        console.log(e.message);
        res.status(400).end();
    }
})