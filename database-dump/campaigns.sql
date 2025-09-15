-- Table structure for campaigns
CREATE TABLE `campaigns` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `segmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduledAt` datetime(3) DEFAULT NULL,
  `startedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaigns_userId_fkey` (`userId`),
  KEY `campaigns_segmentId_fkey` (`segmentId`),
  CONSTRAINT `campaigns_segmentId_fkey` FOREIGN KEY (`segmentId`) REFERENCES `segments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `campaigns_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for campaigns
INSERT INTO `campaigns` (`id`, `name`, `description`, `message`, `segmentId`, `userId`, `status`, `scheduledAt`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`) VALUES
('cmflcvxd30007b1sdw36epk2s', 'kjdvbkajvd', 'jadnvjl dvlaj vd', 'adjvnj dvla dvlav', 'cmflcv6fg0005b1sdtkrv92sr', 'cmfktszbb0000cwjufaxnklgf', 'draft', NULL, NULL, NULL, Mon Sep 15 2025 16:46:19 GMT+0530 (India Standard Time), Mon Sep 15 2025 16:46:19 GMT+0530 (India Standard Time));
