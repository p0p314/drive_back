import express from 'express';
import { DriveController } from '../controller/DriveController';
import { Users } from '../repositories/Users';
import { UserShares } from '../repositories/UserShares';
export const driveRouter = express.Router();

const tableUserShare = new UserShares();
const tableUsers = new Users();

//METHODE GET
driveRouter.get("/simu", (req, res) => {
    const driveController = new DriveController();
    res.json(driveController.generateSimulatedData());

});

driveRouter.get("/info/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const filePath = params[0];
        let info = await new DriveController().getInfo(res.locals.login, filePath);

        res.json(info);
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
});

driveRouter.get("/content/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const filePath = params[0];
        let content = await new DriveController().getFileContent(res.locals.login, filePath);

        res.send(content);
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }

});

driveRouter.get("/stats", async (req, res) => {
    try {
        let drive_stats = await new DriveController().getStats(res.locals.login);
        res.json(drive_stats);
    } catch (e) {
        console.error(e);
        res.status(+e.message).end();
    }
});



driveRouter.get("/search/content/:query", async (req, res) => {
    try {
        const param = req.params.query;
        const lstFichier = await new DriveController().getFileContaining(res.locals.login, "", param);

        res.json(lstFichier);
    } catch (e) {
        console.error(e.message, e.cause);
        res.status(Number(e.message)).end();
    }
})

driveRouter.get("/search/:query", async (req, res) => {
    try {
        const param = req.params.query;
        const lstFichier = await new DriveController().getFileContainingInName(res.locals.login, "", param);

        res.json(lstFichier);
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
})

driveRouter.get("/shares", async (req, res) => {
    try {
        const id = res.getHeader('id') as number;
        const myShares = await new DriveController().getMyShares(id);

        res.json(myShares)
    } catch (error) {
        console.error(error.message, error.cause);
        res.status(Number(error.message)).end();

    }
})

driveRouter.get("/shared", async (req, res) => {
    try {
        const id = res.getHeader('id') as number;
        const sharedFiles = await new DriveController().getSharedFiles(id);

        res.json(sharedFiles)
    } catch (error) {
        console.error(error.message, error.cause);
        res.status(Number(error.message)).end();

    }
})

driveRouter.get("/shared/:owner_login/*", async (req, res) => {
    try {
        const id = res.getHeader('id') as number;
        const login_cible = req.params.owner_login;
        const filePath = req.params[0];

        const user_cible = tableUsers.getUser(login_cible);
        if (await tableUserShare.as_access(user_cible.rowid, id, filePath)) {
            const fileContent = await new DriveController().getFileContent(login_cible, filePath)
            res.send(fileContent)
        } else res.end()

        // const sharedFiles = await new DriveController().getSharedFiles(id);

    } catch (error) {
        console.error(error.message, error.cause);
        res.status(Number(error.message)).end();

    }
})

driveRouter.get("/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const filePath = params[0];
        const items = await new DriveController().listItemByPath(res.locals.login, filePath);

        res.json(items);
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }

});

// METHODE POST
driveRouter.post("/copyto/:login/*", async (req, res) => {
    try {
        let file1 = req.params[0];
        const user = req.params.login;
        await new DriveController().copyFileToUser(res.locals.login, file1, user);

        res.end();
    } catch (e) {
        if (e.errno == -2) {
            console.error(e);
            res.status(e.message).send();
        } else {
            console.error(e.message, e.cause);
            res.status(+e.message).send();

        }
    }
});

driveRouter.post("/content/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const filePath = params[0];
        await new DriveController().setTextFileContent(
            res.locals.login,
            filePath,
            req.body
        );

        res.end();
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
})


driveRouter.post("/share/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const login = res.locals.login;
        const filePath = params[0];
        const to_login = req.body.login as string;

        await new DriveController().shareFileTo(filePath, login, to_login);
    } catch (error) {
        console.error(error.message, error.cause);
        res.status(Number(error.message)).end();
    }
})

driveRouter.post("/copy/*/to/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const file1 = params[0];
        const file2 = params[1];
        await new DriveController().copyFileTo(file1, file2);

        res.end();
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
});


driveRouter.post("/markdown/*", async (req, res) => {
    try {
        const params = req.params as { "0": string };
        const filePath = params[0];
        await new DriveController().setRasenganToBold(res.locals.login, filePath);

        res.end;
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
})

// METHODE PATCH
driveRouter.patch("/move/*/to/*", async (req, res) => {
    try {

        const params = req.params as { "0": string };
        const file1 = params[0];
        const file2 = params[1];
        await new DriveController().moveFileTo(file1, file2);

        res.end();
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }
});

// METHODE DELETE
driveRouter.delete("/share/*", async (req, res) => {
    try {
        const params = req.params as { "0": string }
        const filePath = params[0];
        const id = res.getHeader('id') as number;
        const target = req.body.target;

        await new DriveController().removeShareFile(id, filePath, target);
    } catch (error) {
        console.error();
    }
})

driveRouter.delete("/*", async (req, res) => {
    try {

        const params = req.params as { "0": string };
        const filePath = params[0];
        await new DriveController().deleteFile(res.locals.login, filePath);

        res.end();
    } catch (e) {
        console.error(e);
        res.status(400).end();
    }

});