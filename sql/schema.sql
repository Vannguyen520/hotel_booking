DROP DATABASE IF EXISTS hotel_booking;
CREATE DATABASE hotel_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_booking;

CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  slug VARCHAR(128) NOT NULL, 
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  description TEXT,
  thumbnail_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE daily_prices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  day DATE NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_hotel_day (hotel_id, day),
  INDEX idx_hotel_day (hotel_id, day),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  checkin DATE NOT NULL,
  checkout DATE NOT NULL, 
  rooms INT NOT NULL DEFAULT 1,  
  total_price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'VND',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hotel_dates (hotel_id, checkin, checkout),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;
