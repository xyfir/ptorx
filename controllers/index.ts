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
    .update(require("./emails/update"))
    .delete(require("./emails/delete"));
router.post("/emails/:email/send", require("./emails/send"));
router.get("/emails/:email/messages", require("./emails/messages/list"));
router.route("/emails/:email/messages/:id")
    .get(require("./emails/messages/get"))
    .post(require("./emails/messages/reply"))
    .delete(require("./emails/messages/delete"));

// Filter controllers
router.get("/filters", require("./filters/list"));
router.route("/filters/:filter")
    .get(require("./filters/get"))
    .post(require("./filters/create"))
    .update(require("./filters/update"))
    .delete(require("./filters/delete"));

// Modifier controllers
router.get("/modifiers", require("./modifiers/list"));
router.route("/modifiers/:mod")
    .get(require("./modifiers/get"))
    .post(require("./modifiers/create"))
    .update(require("./modifiers/update"))
    .delete(require("./modifiers/delete"));

// Account controllers
router.get("/account", require("./account/info"));
router.update("/account/subscription", require("./account/purchase"));
router.route("/account/email/:id")
    .post(require("./account/email/add"))
    .delete(require("./account/email/delete"));
router.post("/account/login", require("./account/login"));

export = router;