ALTER TABLE `messages` DROP `text`, DROP `html`, DROP `headers`;
ALTER TABLE `messages` CHANGE `raw` `raw` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
DROP TABLE `ptorx`.`message_attachments`