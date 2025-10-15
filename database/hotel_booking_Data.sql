-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 02, 2025 at 10:39 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_booking`
--

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `hotel_id`, `room_id`, `guest_name`, `guest_email`, `checkin`, `checkout`, `price`, `total_price`, `created_at`) VALUES
(1, 1, 1, 'Nguyen Van A', 'a@gmail.com', '2025-10-01', '2025-10-02', 800000.00, 0.00, '2025-10-01 15:22:48'),
(2, 1, 1, 'Nguyen Van A', 'a@gmail.com', '2025-10-01', '2025-10-02', 800000.00, 0.00, '2025-10-01 15:23:19'),
(3, 1, 14, 'Nguyen Van A', 'a@gmail.com', '2025-10-14', '2025-10-15', 2800000.00, 0.00, '2025-10-01 15:23:58'),
(4, 1, 16, 'Nguyen Van A', 'a@gmail.com', '2025-10-01', '2025-10-15', 890000.00, 0.00, '2025-10-01 15:37:43'),
(5, 1, 7, 'Nguyen Van A', 'a@gmail.com', '2025-10-07', '2025-10-09', 2500000.00, 0.00, '2025-10-02 04:12:04'),
(6, 1, 7, 'Nguyen Van A', 'a@gmail.com', '2025-10-07', '2025-10-08', 2500000.00, 0.00, '2025-10-02 06:27:06'),
(7, 1, 6, 'Nguyen Van A', 'a@gmail.com', '2025-10-06', '2025-10-08', 1850000.00, 0.00, '2025-10-02 06:41:34');

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `code`, `name`, `city`, `country`, `description`, `created_at`) VALUES
(1, '537T72', 'BeHome Boutique Hotel', 'Đà Nẵng', 'Việt Nam', 'Khách sạn gần biển, tiện nghi.', '2025-10-01 03:43:58');

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `hotel_id`, `day`, `name`, `description`, `image`, `price`, `capacity`, `available`, `created_at`) VALUES
(1, 1, '2025-10-01', 'Standard Room 1', 'Phòng tiêu chuẩn view thành phố, 2 người/phòng, giường đôi.', 'https://picsum.photos/300/200?random=1', 800000.00, 2, 2, '2025-10-01 13:05:49'),
(2, 1, '2025-10-02', 'Standard Room 2', 'Phòng tiêu chuẩn ấm cúng, có cửa sổ lớn, thích hợp cặp đôi.', 'https://picsum.photos/300/200?random=2', 850000.00, 2, 1, '2025-10-01 13:05:49'),
(3, 1, '2025-10-03', 'Deluxe Room 1', 'Phòng Deluxe sang trọng, view biển, có ban công.', 'https://picsum.photos/300/200?random=3', 1200000.00, 2, 3, '2025-10-01 13:05:49'),
(4, 1, '2025-10-04', 'Deluxe Room 2', 'Phòng Deluxe nội thất cao cấp, tivi thông minh, minibar.', 'https://picsum.photos/300/200?random=4', 1250000.00, 2, 2, '2025-10-01 13:05:49'),
(5, 1, '2025-10-05', 'Family Room 1', 'Phòng lớn cho gia đình 4 người, 2 giường đôi, có bếp nhỏ.', 'https://picsum.photos/300/200?random=5', 1800000.00, 4, 2, '2025-10-01 13:05:49'),
(6, 1, '2025-10-06', 'Family Room 2', 'Phòng Family view sân vườn, có khu vực ăn uống riêng.', 'https://picsum.photos/300/200?random=6', 1850000.00, 4, 1, '2025-10-01 13:05:49'),
(7, 1, '2025-10-07', 'Suite Room 1', 'Phòng Suite cao cấp nhất, phòng khách riêng, bồn tắm lớn.', 'https://picsum.photos/300/200?random=7', 2500000.00, 2, 1, '2025-10-01 13:05:49'),
(8, 1, '2025-10-08', 'Twin Room 1', 'Phòng 2 giường đơn, phù hợp nhóm bạn hoặc đồng nghiệp.', 'https://picsum.photos/300/200?random=8', 950000.00, 2, 3, '2025-10-01 13:05:49'),
(9, 1, '2025-10-09', 'Twin Room 2', 'Phòng twin có ban công, view hồ nước, wifi tốc độ cao.', 'https://picsum.photos/300/200?random=9', 1000000.00, 2, 2, '2025-10-01 13:05:49'),
(10, 1, '2025-10-10', 'Superior Room 1', 'Phòng Superior hiện đại, giường lớn, view vườn.', 'https://picsum.photos/300/200?random=10', 1100000.00, 2, 4, '2025-10-01 13:05:49'),
(11, 1, '2025-10-11', 'Superior Room 2', 'Phòng Superior rộng rãi, có khu làm việc riêng.', 'https://picsum.photos/300/200?random=11', 1150000.00, 2, 3, '2025-10-01 13:05:49'),
(12, 1, '2025-10-12', 'Budget Room 1', 'Phòng giá rẻ cho khách du lịch, nội thất cơ bản.', 'https://picsum.photos/300/200?random=12', 600000.00, 2, 1, '2025-10-01 13:05:49'),
(13, 1, '2025-10-13', 'Budget Room 2', 'Phòng nhỏ gọn, tiện nghi cơ bản, thích hợp nghỉ ngắn ngày.', 'https://picsum.photos/300/200?random=13', 650000.00, 2, 2, '2025-10-01 13:05:49'),
(14, 1, '2025-10-14', 'VIP Room 1', 'Phòng VIP sang trọng, có phòng khách, minibar, view toàn cảnh.', 'https://picsum.photos/300/200?random=14', 2800000.00, 2, 1, '2025-10-01 13:05:49'),
(15, 1, '2025-10-15', 'Penthouse', 'Căn hộ áp mái cao cấp, có phòng khách, bếp riêng, ban công lớn.', 'https://picsum.photos/300/200?random=15', 3500000.00, 4, 1, '2025-10-01 13:05:49'),
(16, 1, '2025-10-01', 'Win Room 3', 'Phòng tiêu chuẩn view thành phố, 2 người/phòng', 'https://picsum.photos/300/200?random=18', 890000.00, 2, 4, '2025-10-01 14:52:36'),
(17, 1, '2025-10-02', 'Win Room 4', 'Phòng cao cấp có ban công, 2 người/phòng', 'https://picsum.photos/300/200?random=17', 1200000.00, 2, 3, '2025-10-01 14:52:36'),
(18, 1, '2025-10-03', 'Win Room 5', 'Phòng gia đình, 4 người/phòng', 'https://picsum.photos/300/200?random=16', 1500000.00, 4, 2, '2025-10-01 14:52:36'),
(19, 1, '2025-10-31', 'Budget 4', 'Phòng tiêu chuẩn view thành phố, 2 người/phòng', 'https://picsum.photos/300/200?random=1', 200000.00, 2, 1, '2025-10-01 16:03:28'),
(20, 1, '2025-10-22', 'Superior Room 5', 'Phòng cao cấp có ban công, 2 người/phòng', 'https://picsum.photos/300/200?random=2', 1200000.00, 2, 2, '2025-10-01 16:03:28'),
(21, 1, '2025-10-25', 'Win 3', 'Phòng gia đình, 4 người/phòng', 'https://picsum.photos/300/200?random=3', 600000.00, 4, 2, '2025-10-01 16:03:28');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
