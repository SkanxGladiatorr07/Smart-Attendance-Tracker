-- AttendAI Database Schema Initialization Script
-- Execute this script in MySQL workbench, phpMyAdmin, or CLI to create the database and tables.

CREATE DATABASE IF NOT EXISTS attendai_db;
USE attendai_db;

-- Table: subjects
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: lecture_schedule
CREATE TABLE IF NOT EXISTS lecture_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    lecture_date DATE NOT NULL,
    lecture_start TIME NOT NULL,
    lecture_end TIME NOT NULL,
    lecture_status ENUM('scheduled', 'cancelled', 'extra') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecture_schedule_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_lecture_schedule_subject_id (subject_id),
    INDEX idx_lecture_schedule_date (lecture_date),
    INDEX idx_lecture_schedule_subject_date (subject_id, lecture_date),
    INDEX idx_lecture_schedule_status_date (lecture_status, lecture_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: attendance_records
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lecture_id INT NOT NULL,
    attendance_status ENUM('present', 'absent', 'pending') NOT NULL DEFAULT 'pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_records_lecture
        FOREIGN KEY (lecture_id) REFERENCES lecture_schedule(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_attendance_records_lecture_id (lecture_id),
    INDEX idx_attendance_records_status (attendance_status),
    INDEX idx_attendance_records_lecture_status (lecture_id, attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: semester_config
CREATE TABLE IF NOT EXISTS semester_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(100) NOT NULL DEFAULT 'Current Semester',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: calendar_events
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_id INT NOT NULL DEFAULT 1,
    event_type ENUM('holiday', 'working_saturday', 'exam_period') NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_calendar_events_type (event_type),
    INDEX idx_calendar_events_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


