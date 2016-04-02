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

// Filter controllers
router.get("/filters", require("./filters/list"));
router.route("/filters/:filter")
    .get(require("./filters/get"))
    .post(require("./filters/create"))
    .update(require("./filters/update"))
    .delete(require("./filters/delete"));

// Account controllers
router.get("/account", require("./account/info"));
router.update("/account/subscription", require("./account/purchase"));
router.route("/account/email/:id")
    .post(require("./account/add-email"))
    .delete(require("./account/delete-email"));
router.post("/account/login", require("./account/login"));

export = router;