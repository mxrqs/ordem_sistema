CREATE TABLE `historyAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`historyId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historyAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requestHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('message','system_event','attachment') NOT NULL,
	`content` text,
	`eventType` enum('status_changed','order_number_assigned','item_added','photo_added','pdf_uploaded','completed','other'),
	`fileName` varchar(255),
	`fileUrl` varchar(500),
	`fileKey` varchar(500),
	`fileType` varchar(50),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requestHistory_id` PRIMARY KEY(`id`)
);
