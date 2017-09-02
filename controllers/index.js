const express = require('express');
const multer = require('multer');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: '26mb', files: 10, fileSize: 26000000
  }
});

/* MAILGUN */
router.post('/receive/:email', upload.any(), require('./receive'));

/* PROXY EMAILS */
router.route('/emails')
  .get(require('./emails/list'))
  .post(require('./emails/create'));
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

/* FILTERS */
router.route('/filters')
  .get(require('./filters/list'))
  .post(require('./filters/create'));
router.route('/filters/:filter')
  .get(require('./filters/get'))
  .put(require('./filters/update'))
  .delete(require('./filters/delete'));

/* MODIFIERS */
router.route('/modifiers')
  .get(require('./modifiers/list'))
  .post(require('./modifiers/create'));
router.route('/modifiers/:mod')
  .get(require('./modifiers/get'))
  .put(require('./modifiers/update'))
  .delete(require('./modifiers/delete'));

/* ACCOUNT */
router.get('/account', require('./account/info'));
router.post('/account/stripe-purchase', require('./account/stripe-purchase'));
router.post('/account/native-purchase', require('./account/native-purchase'));
router.route('/account/email/:email')
  .post(require('./account/email/add'))
  .delete(require('./account/email/delete'));
router.post('/account/login', require('./account/login'));
router.get('/account/logout', require('./account/logout'));

/* DOMAINS */
router.route('/domains')
  .get(require('./domains/list'))
  .post(require('./domains/add'));
router.route('/domains/:domain')
  .get(require('./domains/get'))
  .delete(require('./domains/remove'));
router.put('/domains/:domain/verify', require('./domains/verify'));
router.post('/domains/:domain/users', require('./domains/users/add'));
router.delete('/domains/:domain/users/:user', require('./domains/users/remove'));

module.exports = router;