-- Table structure for users
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `googleId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_googleId_key` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for users
INSERT INTO `users` (`id`, `email`, `name`, `avatar`, `googleId`, `createdAt`, `updatedAt`) VALUES
('cmfktszbb0000cwjufaxnklgf', 'test@example.com', 'Test User', NULL, 'test-google-id', Mon Sep 15 2025 07:52:09 GMT+0530 (India Standard Time), Mon Sep 15 2025 07:52:09 GMT+0530 (India Standard Time)),
('cmfl13r74000012lotocen9va', 'adityakumar28052003@gmail.com', 'Aditya Kumar', 'https://lh3.googleusercontent.com/a/ACg8ocIvv3rEm0qbzSplAossiPUNBYqWF7c3Z19ovtSg9nUUz8Bk3w=s96-c', '107913162562708011578', Mon Sep 15 2025 11:16:29 GMT+0530 (India Standard Time), Mon Sep 15 2025 16:48:33 GMT+0530 (India Standard Time)),
('cmflbvz7l0000b1sd2q2ixlb0', 'adityarajput28052003@gmail.com', 'Aditya Kumar', 'https://lh3.googleusercontent.com/a/ACg8ocLyNXE1wwgP6GS5qt2U-pGmr92j1u-38y7wa7TNww6h9MmPXA=s96-c', '103409840960097549953', Mon Sep 15 2025 16:18:22 GMT+0530 (India Standard Time), Mon Sep 15 2025 16:18:22 GMT+0530 (India Standard Time));
