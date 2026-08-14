PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`author_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`published_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_questions`("id", "question", "author_id", "status", "created_at", "updated_at", "published_at", "deleted_at") SELECT "id", "question", "author_id", "status", "created_at", "updated_at", "published_at", "deleted_at" FROM `questions`;--> statement-breakpoint
DROP TABLE `questions`;--> statement-breakpoint
ALTER TABLE `__new_questions` RENAME TO `questions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `status_idx` ON `questions` (`status`);--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `questions` (`deleted_at`);