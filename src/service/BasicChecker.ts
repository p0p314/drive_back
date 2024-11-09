import { Request, Response, NextFunction } from 'express'
import { Users } from '../repositories/Users'
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import fs from 'fs/promises'

const tableUsers = new Users();

export async function checkBasicAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;
    if (authorization == undefined || !authorization.startsWith("Basic ")) {
        res.status(401).end()
        return;
    }
    const b64Credentials = authorization.substring(6);
    const credentials = atob(b64Credentials).split(":");
    //console.log(b64Credentials, credentials);
    if (credentials.length != 2) {
        res.status(401).end()
        return;
    }
    const isUser = await tableUsers.isUserInDatabase(credentials[0], credentials[1]);
    if (!isUser) {
        res.status(401).end()
        return;
    }
    res.locals.login = credentials[0];
    next();
}

export async function checkBearerAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;
    if (authorization == undefined || !authorization.startsWith("Bearer")) {
        res.status(401).end()
        return;
    }
    const token = authorization.substring(7);
    //Verifier la validité du jwt
    try {
        type Payload = { name: string }
        let decoded = jwt.verify(token, JWT_SECRET) as Payload;
        res.locals.login = decoded.name;
    } catch (error) {
        res.status(401).end()
        return;
    }
    next();

}

export async function checkAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;
    if (authorization == undefined || (!authorization.startsWith("Basic ") && !authorization.startsWith("Bearer "))) {
        res.status(401).end()
        return;
    }

    if (authorization.startsWith("Basic ")) {
        checkBasicAuth(req, res, next);
    }
    else if (authorization.startsWith("Bearer ")) {
        checkBearerAuth(req, res, next);
    }

}

export function setUserHeader(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const login = res.locals.login;
    const user = tableUsers.getUser(login);
    res.setHeader('role', user.role);
    res.setHeader('id', `${user.rowid}`);

    next();
}

export async function checkAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (tableUsers.getUser(res.locals.login).role != "admin") res.status(401).end();
    next();
}

export async function LoggerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!await fs.exists("logs/")) {
        await fs.mkdir("logs/");
    }

    let file = await fs.open('logs/log.txt', 'a');
    let date = new Date().toISOString();
    file.write(`${date} ${req.method} ${req.url}\n`);
    next();
}