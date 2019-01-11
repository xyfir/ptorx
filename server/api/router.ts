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

router.get('/affiliates', c.getAffiliateInfo);
router.post('/affiliates/key', c.generateAffiliateKey);

router.post('/affiliates/accounts', c.addAccountAsAffiliate);
router.delete('/affiliates/accounts/:id', c.deleteAccountAsAffiliate);

router.get('/affiliates/pay', c.finishAffiliatePayment);
router.post('/affiliates/pay', c.startAffiliatePayment);

router.post('/receive/reply', c.receiveReply);
router.post('/receive/:email', upload.any(), c.receiveMail);

router
  .route('/proxy-emails')
  .get(c.getProxyEmails)
  .post(c.addProxyEmail);
router.get('/proxy-emails/availability', c.getProxyEmailAvailability);
router
  .route('/proxy-emails/:email')
  .get(c.getProxyEmail)
  .put(c.editProxyEmail)
  .delete(c.deleteProxyEmail);
router
  .route('/proxy-emails/:email/messages')
  .get(c.getMessages)
  .post(c.sendMessage);
router
  .route('/proxy-emails/:email/messages/:message')
  .get(c.getMessage)
  .post(c.replyToMessage)
  .delete(c.deleteMessage);

router
  .route('/filters')
  .get(c.getFilters)
  .post(c.addFilter);
router
  .route('/filters/:filter')
  .get(c.getFilter)
  .put(c.editFilter)
  .delete(c.deleteFilter);

router
  .route('/modifiers')
  .get(c.getModifiers)
  .post(c.addModifier);
router
  .route('/modifiers/:mod')
  .get(c.getModifier)
  .put(c.editModifier)
  .delete(c.deleteModifier);

router.get('/primary-emails', c.getPrimaryEmails);
router.post('/primary-emails', c.addPrimaryEmail);
router.delete('/primary-emails/:email', c.deletePrimaryEmail);

router.get('/account', c.getAccountInfo);
router.put('/account/email/template', c.setEmailTemplate);
router.post('/account/login', c.login);
router.get('/account/logout', c.logout);

router.post('/account/credits/purchase', c.startCreditsPurchase);
router.get('/account/credits/purchase', c.finishCreditsPurchase);

router
  .route('/domains')
  .get(c.getDomains)
  .post(c.addDomain);
router
  .route('/domains/:domain')
  .get(c.getDomain)
  .delete(c.deleteDomain);
router.put('/domains/:domain/verify', c.verifyDomain);
router.post('/domains/:domain/users', c.addDomainUser);
router.delete('/domains/:domain/users/:user', c.deleteDomainUser);
