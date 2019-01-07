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
INSERT INTO `cron_jobs` (`id`, `name`, `lastRun`, `minutesInterval`) VALUES (NULL, 'delete-unpaid-affiliate-accounts', NULL, '60'), (NULL, 'delete-expired-messages', NULL, '60')