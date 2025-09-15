-- Table structure for customers
CREATE TABLE `customers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postalCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `totalOrders` int NOT NULL DEFAULT '0',
  `lastOrderAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for customers
INSERT INTO `customers` (`id`, `email`, `name`, `phone`, `address`, `city`, `state`, `country`, `postalCode`, `totalSpent`, `totalOrders`, `lastOrderAt`, `createdAt`, `updatedAt`) VALUES
('cmfk69i460000ykccsszk4izy', 'john.doe@example.com', 'John Doe', '+1234567890', '123 Main St', 'New York', 'NY', 'USA', '10001', '150.00', 1, Mon Sep 15 2025 12:05:05 GMT+0530 (India Standard Time), Sun Sep 14 2025 20:53:09 GMT+0530 (India Standard Time), Mon Sep 15 2025 12:05:05 GMT+0530 (India Standard Time)),
('cmfk69qg00001ykccu4ytj8d0', 'jane.smith@example.com', 'Jane Smith', '+1234567891', '456 Oak Ave', 'Los Angeles', 'CA', 'USA', '90210', '1200.00', 1, Mon Sep 15 2025 08:20:27 GMT+0530 (India Standard Time), Sun Sep 14 2025 20:53:20 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:20:27 GMT+0530 (India Standard Time)),
('cmfk6rsmx0004ykccv6ne8xj1', 'abc@gmail.com', 'abc', '123456', 'India Gate', 'Delhi', 'Delhi', 'India', '110001', '0.00', 0, NULL, Sun Sep 14 2025 21:07:23 GMT+0530 (India Standard Time), Mon Sep 15 2025 08:03:59 GMT+0530 (India Standard Time)),
('cmfk7s2yw000073m6n55q99my', 'test@example.com', 'Test User', '+1234567890', '123 Test St', 'Test City', 'Test State', 'Test Country', '12345', '600.00', 1, Mon Sep 15 2025 11:52:36 GMT+0530 (India Standard Time), Sun Sep 14 2025 21:35:36 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:52:37 GMT+0530 (India Standard Time)),
('cmfk7xmeu000173m6evc1hx3n', 'fbvscz@sdgf.com', 'dsvc', '9876', 'vcdx', 'gbvc', 'bvc', 'vbc', 'fvcxz ', '0.00', 0, NULL, Sun Sep 14 2025 21:39:54 GMT+0530 (India Standard Time), Sun Sep 14 2025 21:39:54 GMT+0530 (India Standard Time)),
('cmfkpdr4s000273m6jw975k43', 'bmn@dfg', 'bmn', '65123', 'mkjhbgf', 'jhgf', 'bjhvgcf', 'njhgfdf', '5123', '0.00', 0, NULL, Mon Sep 15 2025 05:48:20 GMT+0530 (India Standard Time), Mon Sep 15 2025 05:48:20 GMT+0530 (India Standard Time)),
('cmfkpmg1b000373m618i6nz22', 'agsf@agd', 'afssf', '521', 'njlk', 'hbjknkm', 'vadcZ', 'radvz', '521', '0.00', 0, NULL, Mon Sep 15 2025 05:55:06 GMT+0530 (India Standard Time), Mon Sep 15 2025 11:40:19 GMT+0530 (India Standard Time)),
('cmfkpp0ka000473m69dabv1ra', 'aef@af', 'afcs', '632', 'olkm', 'nlk', 'unjk', 'inlk', '42', '0.00', 0, NULL, Mon Sep 15 2025 05:57:06 GMT+0530 (India Standard Time), Mon Sep 15 2025 05:57:06 GMT+0530 (India Standard Time)),
('cmfkpzads000573m6hh1r7de2', 'badv@sbf', 'gweafagda', '42', NULL, NULL, NULL, NULL, NULL, '700.00', 1, Mon Sep 15 2025 08:44:50 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:05:05 GMT+0530 (India Standard Time), Mon Sep 15 2025 16:45:13 GMT+0530 (India Standard Time)),
('cmfkpzq8d000673m6df9bkx4d', 'gdavcs@dfvsd', 'gfdas', '851', 'gjhnm', 'hjknjmk', 'hjknkm', 'bhjnkm', '8', '0.00', 0, NULL, Mon Sep 15 2025 06:05:26 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:05:26 GMT+0530 (India Standard Time)),
('cmfkqby49000873m623uu513d', 'bob@gmail.com', 'bob', '987654321', 'Okhla', 'Delhi', 'Delhi', 'India', '110000', '500.00', 1, Mon Sep 15 2025 06:20:10 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:14:56 GMT+0530 (India Standard Time), Mon Sep 15 2025 06:20:10 GMT+0530 (India Standard Time));
