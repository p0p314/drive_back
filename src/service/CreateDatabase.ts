import { Database } from "bun:sqlite";
import fs from 'fs/promises';

await fs.rm("./db.sqlite3");


const db = new Database("./db.sqlite3", { create: true });
db.query(`CREATE TABLE USERS(
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, 
    role VARCHAR(25),
    quota INT
)`).run();

db.query(
    `CREATE TABLE UserShares(
    owner_rowid integer NOT NULL,
    sharedto_rowid integer NOT NULL,
    owner_file_path TEXT NOT NULL,
    FOREIGN key(owner_rowid) references USERS(rowid),
    FOREIGN key(sharedto_rowid) references USERS(rowid))`
).run();

db.query(`INSERT INTO USERS VALUES("luffy","${await Bun.password.hash("niku")}","user",1000000)`).run();
db.query(`INSERT INTO USERS VALUES("naruto","${await Bun.password.hash("ramen")}","user",1000000)`).run();
db.query(`INSERT INTO USERS VALUES("gojo","${await Bun.password.hash("satoru")}","admin",1000000)`).run();
db.query(`INSERT INTO USERS VALUES("nanami","${await Bun.password.hash("kento")}","admin",1000000)`).run();
