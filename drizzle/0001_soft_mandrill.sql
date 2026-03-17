CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`completed` boolean NOT NULL DEFAULT false,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`type` enum('status_change','pdf_attached') NOT NULL,
	`message` text,
	`sent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitValue` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('OS','OC') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('not_started','in_process','completed') NOT NULL DEFAULT 'not_started',
	`pdfUrl` varchar(500),
	`pdfKey` varchar(500),
	`totalValue` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
