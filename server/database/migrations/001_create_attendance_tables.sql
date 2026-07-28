-- Migration: 001_create_attendance_tables.sql
-- Description: Create lecture_schedule and attendance_records tables with foreign keys and indexes.

USE attendai_db;

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
    INDEX idx_lecture_schedule_subject_date (subject_id, lecture_date)
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
    INDEX idx_attendance_records_status (attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
