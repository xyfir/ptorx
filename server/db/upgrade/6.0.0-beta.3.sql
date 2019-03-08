ALTER TABLE `proxy_emails` ADD `canReply` BOOLEAN NOT NULL AFTER `saveMail`;
UPDATE `proxy_emails` SET `canReply` = `saveMail`;