import * as Express from 'express';
import * as c from './controllers';

export const router = Express.Router();

router.get('/proxy-emails', c.api_getProxyEmails);
router.put('/proxy-emails', c.api_editProxyEmail);
router.post('/proxy-emails', c.api_addProxyEmail);
router.delete('/proxy-emails', c.api_deleteProxyEmail);
router.post('/proxy-emails/check', c.api_checkProxyEmail);

router.get('/messages', c.api_getMessages);
router.delete('/messages', c.api_deleteMessage);
router.post('/messages/send', c.api_sendMessage);
router.post('/messages/reply', c.api_replyToMessage);
router.get('/messages/attachment', c.api_getMessageAttachmentBin);

router.get('/filters', c.api_getFilters);
router.put('/filters', c.api_editFilter);
router.post('/filters', c.api_addFilter);
router.delete('/filters', c.api_deleteFilter);

router.get('/modifiers', c.api_getModifiers);
router.put('/modifiers', c.api_editModifier);
router.post('/modifiers', c.api_addModifier);
router.delete('/modifiers', c.api_deleteModifier);

router.get('/primary-emails', c.api_listPrimaryEmails);
router.post('/primary-emails', c.api_addPrimaryEmail);
router.delete('/primary-emails', c.api_deletePrimaryEmail);
router.get('/primary-emails/verify', c.api_verifyPrimaryEmail);

router.get('/account', c.api_getUser);
router.put('/account/template', c.api_setEmailTemplate);
router.post('/account/login', c.api_login);
router.get('/account/logout', c.api_logout);

router.post('/account/credits/purchase', c.api_startCreditsPurchase);
router.get('/account/credits/purchase', c.api_finishCreditsPurchase);

router.get('/domains', c.api_getDomains);
router.post('/domains', c.api_addDomain);
router.delete('/domains', c.api_deleteDomain);
router.post('/domains/verify', c.api_verifyDomain);

router.post('/domains/users', c.api_addDomainUser);
router.put('/domains/users', c.api_editDomainUser);
router.delete('/domains/users', c.api_deleteDomainUser);
