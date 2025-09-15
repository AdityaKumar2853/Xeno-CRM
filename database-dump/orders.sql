-- Table structure for orders
CREATE TABLE `orders` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  KEY `orders_customerId_fkey` (`customerId`),
  CONSTRAINT `orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for orders
INSERT INTO `orders` (`id`, `customerId`, `orderNumber`, `totalAmount`, `status`, `orderDate`, `createdAt`, `updatedAt`) VALUES
('cmfkqioy8000a73m6w0sb6kuy', 'cmfkqby49000873m623uu513d', 'fvghbjj', '500.00', 'completed', Mon Sep 15 2025 06:20:10 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:20:10 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:20:10 GMT+0530 (India Standard Time)),
('cmfktuf4y0004cwjuvkh58wu1', 'cmfk6rsmx0004ykccv6ne8xj1', 'bnmjknm', '200.00', 'refunded', Mon Sep 15 2025 07:53:16 GMT+0530 (India Standard Time), Mon Sep 15 2025 07:53:16 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:03:59 GMT+0530 (India Standard Time)),
('cmfkutd450001qls015569y88', 'cmfk69qg00001ykccu4ytj8d0', 'njhbghbhjn', '1200.00', 'completed', Mon Sep 15 2025 08:20:27 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:20:27 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:20:27 GMT+0530 (India Standard Time)),
('cmfkvoq0z0001jglr6zry52bc', 'cmfkpzads000573m6hh1r7de2', 'cvbn', '700.00', 'completed', Mon Sep 15 2025 08:44:50 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:44:50 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:44:50 GMT+0530 (India Standard Time)),
('cmfl1ye3y0002jugabahep0nc', 'cmfkpmg1b000373m618i6nz22', 'fqwadf', '750.00', 'cancelled', Mon Sep 15 2025 11:40:19 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:40:19 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:40:19 GMT+0530 (India Standard Time)),
('cmfl2e7hz000110duik2xqfoq', 'cmfk7s2yw000073m6n55q99my', 'dsaf', '600.00', 'completed', Mon Sep 15 2025 11:52:36 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:52:36 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:52:36 GMT+0530 (India Standard Time)),
('cmfl2u98l0001eiufq3oc6qjz', 'cmfk69i460000ykccsszk4izy', 'njhgf', '150.00', 'completed', Mon Sep 15 2025 12:05:05 GMT+0530 (India Standard Time), Mon Sep 15 2025 12:05:05 GMT+0530 (India Standard Time), Mon Sep 15 2025 12:05:05 GMT+0530 (India Standard Time));
