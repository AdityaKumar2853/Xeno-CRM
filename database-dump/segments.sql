-- Table structure for segments
CREATE TABLE `segments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rules` json NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `segments_userId_fkey` (`userId`),
  CONSTRAINT `segments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for segments
INSERT INTO `segments` (`id`, `name`, `description`, `rules`, `userId`, `createdAt`, `updatedAt`) VALUES
('cmflcv6fg0005b1sdtkrv92sr', 'holiday', '50%off for everyone', [object Object], 'cmfktszbb0000cwjufaxnklgf', Mon Sep 15 2025 16:45:44 GMT+0530 (India Standard Time), Mon Sep 15 2025 16:45:44 GMT+0530 (India Standard Time));
