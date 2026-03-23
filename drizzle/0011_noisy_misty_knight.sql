CREATE TABLE `itemsUsed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit` varchar(50) NOT NULL DEFAULT 'un',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itemsUsed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenanceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`placa` varchar(20) NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `maintenanceAlerts_id` PRIMARY KEY(`id`)
);
