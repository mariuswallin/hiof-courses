ALTER TABLE `tasks` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `sort_order_idx` ON `tasks` (`sort_order`);