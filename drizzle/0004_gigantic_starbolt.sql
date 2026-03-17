CREATE TABLE `orderPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`label` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderPhotos_id` PRIMARY KEY(`id`)
);
