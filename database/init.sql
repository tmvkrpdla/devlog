-- Run once as a MariaDB administrator. Local development only.
CREATE DATABASE IF NOT EXISTS devlog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'devlog'@'localhost' IDENTIFIED BY 'devlog_local';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, REFERENCES ON devlog.* TO 'devlog'@'localhost';
