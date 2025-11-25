-- Portaverse_V2.tb_user_role_code definition

CREATE TABLE `tb_user_role_code` (
  `user_role_code_id` int NOT NULL AUTO_INCREMENT,
  `role_code` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_role_code_id`),
  KEY `tb_user_role_code_FK` (`user_id`) USING BTREE,
  KEY `tb_user_role_code_role_code_IDX` (`role_code`) USING BTREE,
  KEY `idx_role_code_user` (`role_code`,`user_id`),
  CONSTRAINT `tb_user_role_code_FK` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;