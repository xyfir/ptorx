/// <reference path="typings/main.d.ts" />

import * as express from "express";


let app = express();

let config = require("./config").environment;

app.listen(config.port, () => { console.log("SERVER RUNNING ON ", config.port); });

// Express middleware / controllers
app.use("/", express.static(__dirname + "/public"));
app.get("/*", (req, res) => {
    res.sendFile(__dirname + "/views/Home.html");
});
app.get("/panel/*", (req, res) => {
    res.sendFile(__dirname + "/views/Panel.html");
});
app.use("/api", require("./controllers/"));