-- Add cron jobs
INSERT INTO `cron_jobs` (`id`, `name`, `lastRun`, `minutesInterval`) VALUES (NULL, 'delete-expired-messages', NULL, '60');
INSERT INTO `cron_jobs` (`id`, `name`, `lastRun`, `minutesInterval`) VALUES (NULL, 'top-up-credits', NULL, '43800');
INSERT INTO `cron_jobs` (`id`, `name`, `lastRun`, `minutesInterval`) VALUES (NULL, 'reset-tiers', NULL, '1440');