const express =  require("express");
const session = require("express-session");
const parser = require("body-parser");

let sstore = require("express-mysql-session");
let app = express();

let config = require("./config");
app.listen(config.environment.port, () => {
    console.log("~~Server running on port", config.environment.port);
});

/* Sessions */
let sessionStore = new sstore({
    host: config.database.mysql.host,
    port: config.database.mysql.port,
    user: config.database.mysql.user,
    password: config.database.mysql.password,
    database: config.database.mysql.database,
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
app.use("/static", express.static(__dirname + "/static"));
app.get("/panel/*", (req, res) => {
    res.sendFile(__dirname + "/views/Panel.html");
});
app.use("/api", require("./controllers/"));
app.get("/*", (req, res) => {
    if (config.environment.type == "dev") {
        req.session.uid = 1,
        req.session.subscription = Date.now() + (1000 * 60 * 60);
    }
    res.sendFile(__dirname + "/views/Home.html");
});