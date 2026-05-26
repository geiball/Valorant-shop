CREATE DATABASE IF NOT EXISTS valorant_store
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE valorant_store;

CREATE TABLE IF NOT EXISTS skins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  weapon VARCHAR(50) NOT NULL,
  price INT NOT NULL,
  rarity ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
  popularity INT DEFAULT 0,
  image_url VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
