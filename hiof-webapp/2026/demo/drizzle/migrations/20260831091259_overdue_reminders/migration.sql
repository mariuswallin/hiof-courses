ALTER TABLE `tasks` ADD `reminder_sent_at` integer;--> statement-breakpoint
CREATE INDEX `due_date_reminder_idx` ON `tasks` (`due_date`,`reminder_sent_at`);