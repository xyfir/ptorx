import * as express from "express";

let router = express.Router();

// MailGun Inbound Controllers
router.post("/receive/free/:email", require("./receive/free"));
router.post("/receive/paid/:email", require("./receive/paid"));

// (Redirect) email controllers
router.get("/emails", require("./emails/list"));
router.route("/emails/:email")
    .get(require("./emails/get"))
    .post(require("./emails/create"))
    .put(require("./emails/update"))
    .delete(require("./emails/delete"));
router.get("/emails/:email/messages", require("./emails/messages/list"));
router.post("/emails/:email/messages", require("./emails/messages/send"));
router.route("/emails/:email/messages/:message")
    .get(require("./emails/messages/get"))
    .post(require("./emails/messages/reply"))
    .delete(require("./emails/messages/delete"));

// Filter controllers
router.get("/filters", require("./filters/list"));
router.post("/filters", require("./filters/create"));
router.route("/filters/:filter")
    .get(require("./filters/get"))
    .put(require("./filters/update"))
    .delete(require("./filters/delete"));

// Modifier controllers
router.get("/modifiers", require("./modifiers/list"));
router.post("/modifiers", require("./modifiers/create"));
router.route("/modifiers/:mod")
    .get(require("./modifiers/get"))
    .put(require("./modifiers/update"))
    .delete(require("./modifiers/delete"));

// Account controllers
router.get("/account", require("./account/info"));
router.put("/account/subscription", require("./account/purchase"));
router.route("/account/email/:email")
    .post(require("./account/email/add"))
    .delete(require("./account/email/delete"));
router.post("/account/login", require("./account/login"));

export = router;