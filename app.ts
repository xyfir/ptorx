/// <reference path="typings/main.d.ts" />

import * as express from "express";
import * as session from "express-session";
import * as parser from "body-parser";

let sstore = require("express-mysql-session");
let app = express();

let config = require("./config");
app.listen(config.environment.port, () => {
    console.log("SERVER RUNNING ON", config.environment.port);
});

/* Sessions */
let sessionStore = new sstore({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    useConnectionPooling: true
});
app.use(session({
    secret: config.secrets.session,
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: false
    }
}));

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// Express middleware / controllers
app.use("/", express.static(__dirname + "/public"));
app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/views/Home.html");
});
app.get("/panel/*", (req, res) => {
    res.sendFile(__dirname + "/views/Panel.html");
});
app.use("/api", require("./controllers/"));