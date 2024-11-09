import express from 'express';
import { driveRouter } from './routes/DriveRouter';
import bodyParser from 'body-parser';
import { checkAuth, checkAdmin, setUserHeader, LoggerMiddleware } from './service/BasicChecker';
import { userRouteur } from './routes/UserRouter';
import { adminRouteur } from './routes/AdminRouter';

const app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send(`<H1>Seminaire</H1>`);
});

app.use("/", LoggerMiddleware)
app.use("/drive", checkAuth, setUserHeader, driveRouter);
app.use("/user", userRouteur);

app.use("/admin", checkAuth, checkAdmin, adminRouteur);

app.listen(3000, () => {
    console.log("serveur démarré");
});