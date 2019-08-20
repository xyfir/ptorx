-- Add MySQL user
CREATE USER 'ptorx'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON *.* TO 'ptorx'@'localhost';
FLUSH PRIVILEGES;

-- Add Ptorx user
INSERT INTO `users` (`email`, `credits`, `tier`, `tierExpiration`) VALUES ('test@xyfir.com', 1500, 'premium', 2147483647);

-- Add domain
INSERT INTO `domains` (`userId`, `domain`, `verified`, `global`, `publicKey`, `privateKey`, `selector`, `created`) VALUES (1, 'dev.ptorx.com', 1, 1, '', '', '', 0);

-- Add alias
INSERT INTO `aliases` (`userId`, `domainId`, `address`, `name`, `created`, `smtpKey`, `saveMail`, `canReply`) VALUES (1, 1, 'alias12', '', 0, '', 1, 1);

-- Add primary email and link to alias
INSERT INTO `primary_emails` (`userId`, `address`, `verified`, `created`, `key`, `autolink`) VALUES (1, 'user@example.com', 1, 0, '', 0);
INSERT INTO `links` (`aliasId`, `primaryEmailId`, `orderIndex`) VALUES (1, 1, 0);