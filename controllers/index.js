const express = require('express');

const router = express.Router();

// MailGun Inbound Controllers
router.post('/receive/free/:email', require('./receive/free'));
router.post('/receive/paid/:email', require('./receive/paid'));
router.post('/receive/:email', require('./receive'));

// (Redirect) email controllers
router.get('/emails', require('./emails/list'));
router.post('/emails', require('./emails/create'));
router.route('/emails/:email')
  .get(require('./emails/get'))
  .put(require('./emails/update'))
  .delete(require('./emails/delete'));
router.get('/emails/:email/messages', require('./emails/messages/list'));
router.post('/emails/:email/messages', require('./emails/messages/send'));
router.route('/emails/:email/messages/:message')
  .get(require('./emails/messages/get'))
  .post(require('./emails/messages/reply'))
  .delete(require('./emails/messages/delete'));

// Filter controllers
router.get('/filters', require('./filters/list'));
router.post('/filters', require('./filters/create'));
router.route('/filters/:filter')
  .get(require('./filters/get'))
  .put(require('./filters/update'))
  .delete(require('./filters/delete'));

// Modifier controllers
router.get('/modifiers', require('./modifiers/list'));
router.post('/modifiers', require('./modifiers/create'));
router.route('/modifiers/:mod')
  .get(require('./modifiers/get'))
  .put(require('./modifiers/update'))
  .delete(require('./modifiers/delete'));

// Account controllers
router.get('/account', require('./account/info'));
router.post('/account/stripe-purchase', require('./account/stripe-purchase'));
router.post('/account/native-purchase', require('./account/native-purchase'));
router.route('/account/email/:email')
  .post(require('./account/email/add'))
  .delete(require('./account/email/delete'));
router.post('/account/login', require('./account/login'));
router.get('/account/logout', require('./account/logout'));

module.exports = router;