-- Table structure for segment_customers
CREATE TABLE `segment_customers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `segmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `segment_customers_segmentId_customerId_key` (`segmentId`,`customerId`),
  KEY `segment_customers_customerId_fkey` (`customerId`),
  CONSTRAINT `segment_customers_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `segment_customers_segmentId_fkey` FOREIGN KEY (`segmentId`) REFERENCES `segments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

