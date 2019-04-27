import * as Express from 'express';
import * as c from './controllers';

export const router = Express.Router();

router.get('/aliases', c.api_getAliases);
router.put('/aliases', c.api_editAlias);
router.post('/aliases', c.api_addAlias);
router.delete('/aliases', c.api_deleteAlias);
router.post('/aliases/check', c.api_checkAlias);

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

router.get('/primary-emails', c.api_getPrimaryEmails);
router.put('/primary-emails', c.api_editPrimaryEmail);
router.post('/primary-emails', c.api_addPrimaryEmail);
router.delete('/primary-emails', c.api_deletePrimaryEmail);
router.get('/primary-emails/verify', c.api_verifyPrimaryEmail);

router.get('/users', c.api_getUser);
router.put('/users/keys', c.api_setPGPKeys);
router.get('/users/logout', c.api_logout);

router.post('/payments/start', c.api_startPayment);
router.post('/payments/finish', c.api_finishPayment);

router.get('/domains', c.api_getDomains);
router.post('/domains', c.api_addDomain);
router.delete('/domains', c.api_deleteDomain);
router.post('/domains/verify', c.api_verifyDomain);

router.get('/domains/users', c.api_listDomainUsers);
router.post('/domains/users', c.api_addDomainUser);
router.put('/domains/users', c.api_editDomainUser);
router.delete('/domains/users', c.api_deleteDomainUser);
