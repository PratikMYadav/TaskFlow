-- =====================================================================
-- TaskFlow Database Initialization Script
-- Project: TaskFlow - Task Management Application
-- Target Database: MySQL 8.0+
-- Tool: MySQL Workbench / MySQL CLI
-- =====================================================================

-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS `taskflow_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `taskflow_db`;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `hashed_password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_users_email` UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    `status` ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
    `due_date` DATE NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tasks_user_id` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS `idx_users_email` ON `users` (`email`);
CREATE INDEX IF NOT EXISTS `idx_tasks_user_id` ON `tasks` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_tasks_status` ON `tasks` (`status`);
CREATE INDEX IF NOT EXISTS `idx_tasks_priority` ON `tasks` (`priority`);
CREATE INDEX IF NOT EXISTS `idx_tasks_due_date` ON `tasks` (`due_date`);
CREATE INDEX IF NOT EXISTS `idx_tasks_created_at` ON `tasks` (`created_at`);

-- =====================================================================
-- Optional: Dedicated application user for enhanced security
-- Uncomment and run the lines below if you wish to use a non-root user:
--
-- CREATE USER IF NOT EXISTS 'taskflow_user'@'localhost' IDENTIFIED BY 'TaskFlow@2026';
-- GRANT ALL PRIVILEGES ON `taskflow_db`.* TO 'taskflow_user'@'localhost';
-- FLUSH PRIVILEGES;
-- =====================================================================
