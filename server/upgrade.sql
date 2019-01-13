-- improve db
ALTER TABLE `domains` DROP FOREIGN KEY `fk_domains__user_id`; ALTER TABLE `domains` ADD CONSTRAINT `fk__domains__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`domains` DROP INDEX `fk_domains__user_id`, ADD INDEX `fk__domains__user_id` (`user_id`) USING BTREE;
ALTER TABLE `domain_users` DROP FOREIGN KEY `fk_domain_users__domain_id`; ALTER TABLE `domain_users` ADD CONSTRAINT `fk__domain_users__domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `domain_users` DROP FOREIGN KEY `fk_domain_users__user_id`; ALTER TABLE `domain_users` ADD CONSTRAINT `fk__domain_users__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`domain_users` DROP INDEX `fk_domain_users__user_id`, ADD INDEX `fk__domain_users__user_id` (`user_id`) USING BTREE;
ALTER TABLE `filters` DROP FOREIGN KEY `filters_ibfk1`; ALTER TABLE `filters` ADD CONSTRAINT `fk__filters__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `ptorx`.`filters` DROP INDEX `fk_user`, ADD INDEX `fk__filters__user_id` (`user_id`) USING BTREE;
ALTER TABLE ptorx.linked_filters DROP FOREIGN KEY linked_filters_ibfk_2;
ALTER TABLE `linked_filters` DROP FOREIGN KEY `linked_filters_ibfk_1`; ALTER TABLE `linked_filters` ADD CONSTRAINT `fk__linked_filters__filter_id` FOREIGN KEY (`filter_id`) REFERENCES `filters`(`filter_id`) ON DELETE CASCADE ON UPDATE NO ACTION; ALTER TABLE `linked_filters` DROP FOREIGN KEY `linked_filters_ibfk_3`; ALTER TABLE `linked_filters` ADD CONSTRAINT `fk__linked_filters__email_id` FOREIGN KEY (`email_id`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `ptorx`.`linked_filters` DROP INDEX `fk_email`, ADD INDEX `fk__linked_filters__email_id` (`email_id`) USING BTREE;
ALTER TABLE `linked_modifiers` DROP FOREIGN KEY `linked_modifiers_ibfk_1`; ALTER TABLE `linked_modifiers` ADD CONSTRAINT `fk__linked_modifiers__modifier_id` FOREIGN KEY (`modifier_id`) REFERENCES `modifiers`(`modifier_id`) ON DELETE CASCADE ON UPDATE NO ACTION; ALTER TABLE `linked_modifiers` DROP FOREIGN KEY `linked_modifiers_ibfk_2`; ALTER TABLE `linked_modifiers` ADD CONSTRAINT `fk__linked_modifiers__email_id` FOREIGN KEY (`email_id`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `linked_modifiers` DROP FOREIGN KEY `fk__linked_modifiers__email_id`; ALTER TABLE `linked_modifiers` ADD CONSTRAINT `fk__linked_modifiers__email_id` FOREIGN KEY (`email_id`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `linked_modifiers` DROP FOREIGN KEY `fk__linked_modifiers__modifier_id`; ALTER TABLE `linked_modifiers` ADD CONSTRAINT `fk__linked_modifiers__modifier_id` FOREIGN KEY (`modifier_id`) REFERENCES `modifiers`(`modifier_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`linked_modifiers` DROP INDEX `fk_email`, ADD INDEX `fk__linked_modifiers__email_id` (`email_id`) USING BTREE;
ALTER TABLE `linked_filters` DROP FOREIGN KEY `fk__linked_filters__email_id`; ALTER TABLE `linked_filters` ADD CONSTRAINT `fk__linked_filters__email_id` FOREIGN KEY (`email_id`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `linked_filters` DROP FOREIGN KEY `fk__linked_filters__filter_id`; ALTER TABLE `linked_filters` ADD CONSTRAINT `fk__linked_filters__filter_id` FOREIGN KEY (`filter_id`) REFERENCES `filters`(`filter_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `filters` DROP FOREIGN KEY `fk__filters__user_id`; ALTER TABLE `filters` ADD CONSTRAINT `fk__filters__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `messages` DROP FOREIGN KEY `fk_messages__email_id`; ALTER TABLE `messages` ADD CONSTRAINT `fk__messages__email_id` FOREIGN KEY (`email_id`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`messages` DROP INDEX `fk_messages__email_id`, ADD INDEX `fk__messages__email_id` (`email_id`) USING BTREE;
ALTER TABLE `modifiers` DROP FOREIGN KEY `modifiers_ibfk_1`; ALTER TABLE `modifiers` ADD CONSTRAINT `fk__modifiers__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`modifiers` DROP INDEX `fk_user`, ADD INDEX `fk__modifiers__user_id` (`user_id`) USING BTREE;
ALTER TABLE `primary_emails` DROP FOREIGN KEY `primary_emails_ibfk_1`; ALTER TABLE `primary_emails` ADD CONSTRAINT `fk__primary_emails__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`primary_emails` DROP INDEX `fk_user`, ADD INDEX `fk__primary_emails__user_id` (`user_id`) USING BTREE;
ALTER TABLE `proxy_emails` DROP FOREIGN KEY `fk_redirect_emails__domain_id`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__redirect_emails__domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `proxy_emails` DROP FOREIGN KEY `proxy_emails_ibfk_1`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `proxy_emails` DROP FOREIGN KEY `proxy_emails_ibfk_2`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__primary_email_id` FOREIGN KEY (`primary_email_id`) REFERENCES `primary_emails`(`email_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk_redirect_emails__domain_id`, ADD INDEX `fk__redirect_emails__domain_id` (`domain_id`) USING BTREE;
ALTER TABLE `proxy_emails` DROP FOREIGN KEY `fk__redirect_emails__domain_id`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk__redirect_emails__domain_id`, ADD INDEX `fk__proxy_emails__domain_id` (`domain_id`) USING BTREE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk_email`, ADD INDEX `fk__proxy_emails__primary_email_id` (`primary_email_id`) USING BTREE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk_user`, ADD INDEX `fk__proxy_emails__user_id` (`user_id`) USING BTREE;
-- create cron_jobs
CREATE TABLE `cron_jobs` (
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
 `name` varchar(100) NOT NULL,
 `lastRun` datetime DEFAULT NULL,
 `minutesInterval` mediumint(11) unsigned NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
INSERT INTO `cron_jobs` (`id`, `name`, `lastRun`, `minutesInterval`) VALUES (NULL, 'delete-expired-messages', NULL, '60')
-- remove affiliates/admins
DROP TABLE `ptorx`.`affiliate_created_users`;
DROP TABLE `ptorx`.`affiliates`;
ALTER TABLE `users` DROP `affiliate`;
ALTER TABLE `users` DROP `admin`;
-- improve db columns naming
ALTER TABLE `domains` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `domains` DROP FOREIGN KEY `fk__domains__user_id`; ALTER TABLE `domains` ADD CONSTRAINT `fk__domains__userId` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`domains` DROP INDEX `fk__domains__user_id`, ADD INDEX `fk__domains__userId` (`userId`) USING BTREE;
ALTER TABLE `domains` CHANGE `domain_key` `domainKey` MEDIUMTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE `domain_users` CHANGE `domain_id` `domainId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `domain_users` DROP FOREIGN KEY `fk__domain_users__domain_id`; ALTER TABLE `domain_users` ADD CONSTRAINT `fk__domain_users__domainId` FOREIGN KEY (`domainId`) REFERENCES `domains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `domain_users` DROP FOREIGN KEY `fk__domain_users__user_id`; ALTER TABLE `domain_users` ADD CONSTRAINT `fk__domain_users__userId` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `domain_users` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `domain_users` CHANGE `request_key` `requestKey` VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;
ALTER TABLE `filters` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `filters` CHANGE `filter_id` `filterId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `filters` CHANGE `accept_on_match` `acceptOnMatch` TINYINT(1) NOT NULL, CHANGE `use_regex` `useRegex` TINYINT(1) NOT NULL;
ALTER TABLE `ptorx`.`domain_users` DROP INDEX `domain_id`, ADD UNIQUE `domainId` (`domainId`, `userId`) USING BTREE;
ALTER TABLE `ptorx`.`domain_users` DROP INDEX `fk__domain_users__user_id`, ADD INDEX `fk__domain_users__userId` (`userId`) USING BTREE;
ALTER TABLE `filters` DROP FOREIGN KEY `fk__filters__user_id`; ALTER TABLE `filters` ADD CONSTRAINT `fk__filters__userId` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`filters` DROP INDEX `fk__filters__user_id`, ADD INDEX `fk__filters__userId` (`userId`) USING BTREE;
-- linked_filters, linked_modifiers -> links
CREATE TABLE `links` (
 `proxyEmailId` int(10) unsigned NOT NULL,
 `orderIndex` tinyint(3) unsigned NOT NULL,
 `primaryEmailId` int(10) unsigned DEFAULT NULL,
 `modifierId` int(10) unsigned DEFAULT NULL,
 `filterId` int(10) unsigned DEFAULT NULL,
 KEY `fk__link__proxyEmailId` (`proxyEmailId`),
 KEY `fk__link__primaryEmailId` (`primaryEmailId`),
 KEY `fk__link__modifierId` (`modifierId`),
 KEY `fk__link__filterId` (`filterId`),
 CONSTRAINT `fk__link__filterId` FOREIGN KEY (`filterId`) REFERENCES `filters` (`filterId`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `fk__link__modifierId` FOREIGN KEY (`modifierId`) REFERENCES `modifiers` (`modifier_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `fk__link__primaryEmailId` FOREIGN KEY (`primaryEmailId`) REFERENCES `primary_emails` (`email_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `fk__link__proxyEmailId` FOREIGN KEY (`proxyEmailId`) REFERENCES `proxy_emails` (`email_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `links` (proxyEmailId, filterId) SELECT email_id, filter_id FROM linked_filters;
INSERT INTO `links` (proxyEmailId, modifierId, orderIndex) SELECT email_id, modifier_id, order_number FROM linked_modifiers;
DROP TABLE `ptorx`.`linked_filters`;
DROP TABLE `ptorx`.`linked_modifiers`;
DROP IF EXISTS TABLE `ptorx`.`linked_objects`;
-- improve db columns naming
ALTER TABLE `messages` CHANGE `email_id` `emailId` INT(10) UNSIGNED NOT NULL, CHANGE `message_url` `url` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE `messages` CHANGE `emailId` `proxyEmailId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `messages` DROP FOREIGN KEY `fk__messages__email_id`; ALTER TABLE `messages` ADD CONSTRAINT `fk__messages__proxyEmailId` FOREIGN KEY (`proxyEmailId`) REFERENCES `proxy_emails`(`email_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`messages` DROP INDEX `fk__messages__email_id`, ADD INDEX `fk__messages__proxyEmailId` (`proxyEmailId`) USING BTREE;
ALTER TABLE `modifiers` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `modifiers` CHANGE `modifier_id` `modifierId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `modifiers` DROP FOREIGN KEY `fk__modifiers__user_id`; ALTER TABLE `modifiers` ADD CONSTRAINT `fk__modifiers__userId` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`modifiers` DROP INDEX `fk__modifiers__user_id`, ADD INDEX `fk__modifiers__userId` (`userId`) USING BTREE;
ALTER TABLE `primary_emails` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL, CHANGE `email_id` `primaryEmailId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `primary_emails` DROP FOREIGN KEY `fk__primary_emails__user_id`; ALTER TABLE `primary_emails` ADD CONSTRAINT `fk__primary_emails__userId` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`primary_emails` DROP INDEX `fk__primary_emails__user_id`, ADD INDEX `fk__primary_emails__userId` (`userId`) USING BTREE;
ALTER TABLE `proxy_emails` CHANGE `email_id` `proxyEmailId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, CHANGE `user_id` `userId` INT(10) UNSIGNED NULL DEFAULT NULL, CHANGE `domain_id` `domainId` INT(10) UNSIGNED NOT NULL, CHANGE `primary_email_id` `primaryEmailId` INT(10) UNSIGNED NULL DEFAULT NULL, CHANGE `mg_route_id` `mgRouteId` VARCHAR(24) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL, CHANGE `spam_filter` `spamFilter` TINYINT(1) NOT NULL, CHANGE `save_mail` `saveMail` TINYINT(1) NOT NULL, CHANGE `direct_forward` `directForward` TINYINT(1) NOT NULL;
ALTER TABLE `proxy_emails` DROP FOREIGN KEY `fk__proxy_emails__domain_id`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__domainId` FOREIGN KEY (`domainId`) REFERENCES `domains`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `proxy_emails` DROP FOREIGN KEY `fk__proxy_emails__primary_email_id`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__primaryEmailId` FOREIGN KEY (`primaryEmailId`) REFERENCES `primary_emails`(`primaryEmailId`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `proxy_emails` DROP FOREIGN KEY `fk__proxy_emails__user_id`; ALTER TABLE `proxy_emails` ADD CONSTRAINT `fk__proxy_emails__userId` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk__proxy_emails__domain_id`, ADD INDEX `fk__proxy_emails__domainId` (`domainId`) USING BTREE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk__proxy_emails__primary_email_id`, ADD INDEX `fk__proxy_emails__primaryEmailId` (`primaryEmailId`) USING BTREE;
ALTER TABLE `ptorx`.`proxy_emails` DROP INDEX `fk__proxy_emails__user_id`, ADD INDEX `fk__proxy_emails__userId` (`userId`) USING BTREE;
ALTER TABLE `users` CHANGE `user_id` `userId` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, CHANGE `xyfir_id` `xyfirId` VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL, CHANGE `emails_created` `emailsCreated` INT(10) UNSIGNED NOT NULL, CHANGE `email_template` `emailTemplate` INT(10) UNSIGNED NULL DEFAULT NULL;
ALTER TABLE `users` DROP FOREIGN KEY `fk__users__email_template`; ALTER TABLE `users` ADD CONSTRAINT `fk__users__emailTemplate` FOREIGN KEY (`emailTemplate`) REFERENCES `proxy_emails`(`proxyEmailId`) ON DELETE SET NULL ON UPDATE CASCADE;
-- drop proxy_emails.primary_email_id
ALTER TABLE ptorx.proxy_emails DROP FOREIGN KEY fk__proxy_emails__primaryEmailId;
ALTER TABLE `proxy_emails` DROP INDEX `fk__proxy_emails__primaryEmailId`;
ALTER TABLE `proxy_emails` DROP `primaryEmailId`;
-- rename filters.useRegex
ALTER TABLE `filters` CHANGE `useRegex` `regex` TINYINT(1) NOT NULL;
-- remove users.referral
ALTER TABLE `users` DROP `referral`;
-- update modifiers structure
ALTER TABLE `modifiers` ADD `value` TEXT NULL DEFAULT NULL AFTER `data`, ADD `subject` TINYTEXT NULL DEFAULT NULL AFTER `value`, ADD `with` TINYTEXT NULL DEFAULT NULL AFTER `subject`, ADD `flags` VARCHAR(4) NULL DEFAULT NULL AFTER `with`, ADD `regex` BOOLEAN NULL DEFAULT NULL AFTER `flags`, ADD `prepend` BOOLEAN NULL DEFAULT NULL AFTER `regex`, ADD `target` BOOLEAN NULL DEFAULT NULL AFTER `prepend`;
DELETE FROM `modifiers` WHERE type != 2;
ALTER TABLE `modifiers` DROP `data`;
-- add created columns; remove description
ALTER TABLE `domains` ADD `created` INT UNSIGNED NOT NULL AFTER `added`;
UPDATE `domains` SET created = UNIX_TIMESTAMP(added);
ALTER TABLE `domains` DROP `added`;
ALTER TABLE `domain_users` ADD `created` INT UNSIGNED NOT NULL AFTER `added`;
UPDATE `domain_users` SET created = UNIX_TIMESTAMP(added);
ALTER TABLE `domain_users` DROP `added`;
ALTER TABLE `filters` DROP `description`;
ALTER TABLE `filters` ADD `created` INT UNSIGNED NOT NULL AFTER `regex`;
UPDATE `filters` SET created = UNIX_TIMESTAMP();
ALTER TABLE `messages` CHANGE `received` `created` INT(10) UNSIGNED NOT NULL;
ALTER TABLE `modifiers` DROP `description`;
ALTER TABLE `modifiers` ADD `created` INT UNSIGNED NOT NULL AFTER `target`;
UPDATE `modifiers` SET created = UNIX_TIMESTAMP();
ALTER TABLE `primary_emails` ADD `created` INT UNSIGNED NOT NULL AFTER `address`;
UPDATE `primary_emails` SET created = UNIX_TIMESTAMP();
ALTER TABLE `proxy_emails` DROP `description`;
ALTER TABLE `proxy_emails` ADD `created2` INT UNSIGNED NOT NULL AFTER `created`;
UPDATE `proxy_emails` SET created2 = UNIX_TIMESTAMP(created);
ALTER TABLE `proxy_emails` DROP `created`;
ALTER TABLE `proxy_emails` CHANGE `created2` `created` INT(10) UNSIGNED NOT NULL;
-- increase name length
ALTER TABLE `filters` CHANGE `name` `name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE `modifiers` CHANGE `name` `name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE `proxy_emails` CHANGE `name` `name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;
-- improve modifier structure
ALTER TABLE `modifiers` ADD `add` VARCHAR(20) NULL DEFAULT NULL AFTER `target`, ADD `to` VARCHAR(20) NULL DEFAULT NULL AFTER `add`;
ALTER TABLE `modifiers` ADD `separator` VARCHAR(10) NULL DEFAULT NULL AFTER `to`;
ALTER TABLE `modifiers` DROP `value`;
ALTER TABLE `modifiers` ADD `find` TEXT NULL DEFAULT NULL AFTER `separator`, ADD `tag` VARCHAR(100) NULL DEFAULT NULL AFTER `find`, ADD `template` TEXT NULL DEFAULT NULL AFTER `tag`;
ALTER TABLE `modifiers` CHANGE `with` `replacement` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;
ALTER TABLE `modifiers` CHANGE `target` `target` VARCHAR(10) NULL DEFAULT NULL, CHANGE `add` `add` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL, CHANGE `to` `to` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;