-- Add user
INSERT INTO `users` (`email`, `credits`, `tier`, `tierExpiration`) VALUES ('test@xyfir.com', 1500, 'premium', 2147483647);

-- Add domain
INSERT INTO `domains` (`userId`, `domain`, `verified`, `global`) VALUES (1, 'dev.ptorx.com', 1, 1);

-- Add alias
INSERT INTO `aliases` (`userId`, `domainId`, `address`) VALUES (1, 1, 'alias12');

-- Add primary email and link to alias
INSERT INTO `primary_emails` (`userId`, `address`, `verified`) VALUES (1, 'user@example.com', 1);
INSERT INTO `links` (`aliasId`, `primaryEmailId`) VALUES (1, 1);