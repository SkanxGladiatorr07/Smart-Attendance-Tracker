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
