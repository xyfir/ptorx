import * as Express from 'express';
import * as multer from 'multer';
import * as c from './controllers';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // @ts-ignore
    fieldSize: '26mb',
    files: 10,
    fileSize: 26000000
  }
});

export const router = Express.Router();

router.post('/receive/reply', c.api_receiveReply);
router.post('/receive/:email', upload.any(), c.api_receiveMail);

router
  .route('/proxy-emails')
  .get(c.api_listProxyEmails)
  .post(c.api_addProxyEmail);
router.get('/proxy-emails/availability', c.api_getProxyEmailAvailability);
router
  .route('/proxy-emails/:email')
  .get(c.api_getProxyEmail)
  .put(c.api_editProxyEmail)
  .delete(c.api_deleteProxyEmail);
router
  .route('/proxy-emails/:email/messages')
  .get(c.api_getMessages)
  .post(c.api_sendMessage);
router
  .route('/proxy-emails/:email/messages/:message')
  .get(c.api_getMessage)
  .post(c.api_replyToMessage)
  .delete(c.api_deleteMessage);

router
  .route('/filters')
  .get(c.api_listFilters)
  .post(c.api_addFilter);
router
  .route('/filters/:filter')
  .get(c.api_getFilter)
  .put(c.api_editFilter)
  .delete(c.api_deleteFilter);

router
  .route('/modifiers')
  .get(c.api_listModifiers)
  .post(c.api_addModifier);
router
  .route('/modifiers/:mod')
  .get(c.api_getModifier)
  .put(c.api_editModifier)
  .delete(c.api_deleteModifier);

router.get('/primary-emails', c.api_getPrimaryEmails);
router.post('/primary-emails', c.api_addPrimaryEmail);
router.delete('/primary-emails/:email', c.api_deletePrimaryEmail);

router.get('/account', c.api_getAccountInfo);
router.put('/account/email/template', c.api_setEmailTemplate);
router.post('/account/login', c.api_login);
router.get('/account/logout', c.api_logout);

router.post('/account/credits/purchase', c.api_startCreditsPurchase);
router.get('/account/credits/purchase', c.api_finishCreditsPurchase);

router.get('/domains', c.api_listDomains);
router.post('/domains', c.api_addDomain);

router.post('/domains/users', c.api_addDomainUser);
router.put('/domains/:domain/users/:key', c.api_editDomainUser);
router.delete('/domains/:domain/users/:key', c.api_deleteDomainUser);

router.get('/domains/:domain', c.api_getDomain);
router.delete('/domains/:domain', c.api_deleteDomain);
router.post('/domains/:domain/verify', c.api_verifyDomain);
