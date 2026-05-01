-- ============================================================
-- Smart Campus Event Management System - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_campus_ems;
USE smart_campus_ems;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('ADMIN','ORGANIZER','STUDENT') DEFAULT 'STUDENT',
    department VARCHAR(100),
    profile_pic VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(10),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('ACADEMIC','CULTURAL','SPORTS','TECHNICAL','WORKSHOP','SEMINAR','OTHER') NOT NULL,
    organizer_id BIGINT,
    venue VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    max_capacity INT DEFAULT 100,
    registered_count INT DEFAULT 0,
    banner_image VARCHAR(255),
    status ENUM('UPCOMING','ONGOING','COMPLETED','CANCELLED') DEFAULT 'UPCOMING',
    is_featured BOOLEAN DEFAULT FALSE,
    registration_deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Registrations table
CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registration_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('CONFIRMED','WAITLISTED','CANCELLED','ATTENDED') DEFAULT 'CONFIRMED',
    payment_status ENUM('FREE','PAID','PENDING') DEFAULT 'FREE',
    qr_code TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended_at DATETIME,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO','SUCCESS','WARNING','ALERT') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    event_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Feedback table
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_feedback (event_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Event tags table
CREATE TABLE event_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Chat messages (Chatbot logs)
CREATE TABLE chatbot_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    session_id VARCHAR(100),
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Default Admin
INSERT INTO users (name, email, password, role, department, is_verified) VALUES
('Admin User', 'admin@campus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Administration', TRUE),
('Dr. Priya Sharma', 'priya@campus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ORGANIZER', 'Computer Science', TRUE),
('Rahul Kumar', 'rahul@campus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'Electronics', TRUE);

-- Sample Events
INSERT INTO events (title, description, category, organizer_id, venue, latitude, longitude, start_datetime, end_datetime, max_capacity, is_featured, status) VALUES
('TechFest 2025 - Annual Tech Symposium', 'The biggest technical festival of the year featuring hackathons, robotics competitions, and industry expert talks from top tech companies.', 'TECHNICAL', 2, 'Main Auditorium, Block A', 12.9716, 77.5946, '2025-09-15 09:00:00', '2025-09-17 18:00:00', 500, TRUE, 'UPCOMING'),
('Cultural Night - Fusion 2025', 'A spectacular evening of music, dance, and drama celebrating the diverse cultures of our campus community.', 'CULTURAL', 2, 'Open Air Theatre', 12.9720, 77.5950, '2025-08-20 18:00:00', '2025-08-20 22:00:00', 800, TRUE, 'UPCOMING'),
('Machine Learning Workshop', 'Hands-on workshop covering ML fundamentals, Python libraries, and real-world project implementation.', 'WORKSHOP', 2, 'CS Lab 301', 12.9715, 77.5948, '2025-07-10 10:00:00', '2025-07-10 17:00:00', 60, FALSE, 'UPCOMING'),
('Inter-College Cricket Tournament', 'Annual cricket championship featuring teams from 20+ colleges competing for the prestigious campus trophy.', 'SPORTS', 2, 'Main Cricket Ground', 12.9725, 77.5942, '2025-08-01 08:00:00', '2025-08-05 18:00:00', 200, TRUE, 'UPCOMING'),
('Research Paper Seminar', 'Graduate students present their research findings. Topics include AI, IoT, Blockchain, and Sustainable Tech.', 'SEMINAR', 2, 'Seminar Hall B', 12.9718, 77.5944, '2025-07-25 14:00:00', '2025-07-25 17:00:00', 100, FALSE, 'UPCOMING');

-- Sample Announcements
INSERT INTO announcements (title, content, author_id, is_global) VALUES
('Welcome to Smart Campus EMS!', 'We are excited to launch the new Smart Campus Event Management System. Register for events, get OTP notifications, and stay connected!', 1, TRUE),
('TechFest Registration Open', 'Registrations for TechFest 2025 are now open. Early bird slots are filling fast!', 2, FALSE);
