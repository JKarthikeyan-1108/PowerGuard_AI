-- ============================================================
-- PowerGuard - MySQL Database Schema
-- Complete schema for Smart Electricity Theft Detection
-- ============================================================

CREATE DATABASE IF NOT EXISTS powerguard;
USE powerguard;

-- ============================================================
-- Users Table (all roles)
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('consumer', 'utility', 'admin') NOT NULL DEFAULT 'consumer',
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Consumer Profiles
-- ============================================================
CREATE TABLE consumers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    consumer_id VARCHAR(20) UNIQUE NOT NULL,
    meter_id VARCHAR(20),
    area VARCHAR(100),
    address TEXT,
    connection_type ENUM('residential', 'commercial', 'industrial') DEFAULT 'residential',
    sanctioned_load DECIMAL(10,2) DEFAULT 5.00,
    tariff_category VARCHAR(50) DEFAULT 'domestic',
    status ENUM('active', 'disconnected', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_area (area),
    INDEX idx_meter_id (meter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Utility Officers
-- ============================================================
CREATE TABLE utility_officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    officer_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    assigned_areas JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_officer_id (officer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Admin Profiles
-- ============================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id VARCHAR(20) UNIQUE NOT NULL,
    access_level ENUM('super', 'manager', 'operator') DEFAULT 'operator',
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Smart Meters
-- ============================================================
CREATE TABLE meters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id VARCHAR(20) UNIQUE NOT NULL,
    consumer_id VARCHAR(20),
    area VARCHAR(100),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    address TEXT,
    meter_type ENUM('single_phase', 'three_phase') DEFAULT 'single_phase',
    manufacturer VARCHAR(100),
    firmware_version VARCHAR(50),
    status ENUM('active', 'inactive', 'maintenance', 'tampered') DEFAULT 'active',
    installed_date DATE,
    last_communication DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_meter_id (meter_id),
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_area (area),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Meter Readings (Time-series data)
-- ============================================================
CREATE TABLE meter_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meter_id VARCHAR(20) NOT NULL,
    voltage DECIMAL(8,2) NOT NULL,
    current_amp DECIMAL(8,3) NOT NULL,
    power_watt DECIMAL(10,2) NOT NULL,
    energy_kwh DECIMAL(12,4) NOT NULL,
    frequency DECIMAL(5,2) DEFAULT 50.00,
    power_factor DECIMAL(4,3) DEFAULT 1.000,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_type VARCHAR(50),
    reading_timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_meter_timestamp (meter_id, reading_timestamp),
    INDEX idx_timestamp (reading_timestamp),
    INDEX idx_anomaly (is_anomaly)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Alerts
-- ============================================================
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('high_usage', 'possible_theft', 'meter_offline', 'transformer_overload', 'abnormal_voltage', 'abnormal_current') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    meter_id VARCHAR(20),
    consumer_id VARCHAR(20),
    area VARCHAR(100),
    confidence DECIMAL(5,2),
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INT,
    resolved_at DATETIME,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_created (created_at),
    INDEX idx_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- AI/ML Predictions
-- ============================================================
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_type ENUM('theft_detection', 'bill_prediction', 'demand_forecast', 'consumer_segmentation') NOT NULL,
    consumer_id VARCHAR(20),
    meter_id VARCHAR(20),
    model_name VARCHAR(50),
    model_version VARCHAR(20),
    input_data JSON,
    prediction_result JSON,
    confidence DECIMAL(5,2),
    risk_level ENUM('low', 'medium', 'high'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (prediction_type),
    INDEX idx_consumer (consumer_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Recommendations
-- ============================================================
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consumer_id VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('appliance', 'behavior', 'schedule', 'equipment') NOT NULL,
    estimated_savings DECIMAL(10,2) DEFAULT 0.00,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consumer (consumer_id),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    notification_type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    channel ENUM('in_app', 'email', 'sms') DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Reports
-- ============================================================
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom') NOT NULL,
    format ENUM('pdf', 'csv', 'excel') DEFAULT 'pdf',
    generated_by INT NOT NULL,
    file_path VARCHAR(500),
    file_size INT DEFAULT 0,
    parameters JSON,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (report_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- System Logs
-- ============================================================
CREATE TABLE system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('debug', 'info', 'warn', 'error') NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    source VARCHAR(100),
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_level (level),
    INDEX idx_source (source),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Data: Default Admin User
-- Password: admin123 (bcrypt hashed)
-- ============================================================
INSERT INTO users (name, email, password_hash, phone, role, is_active, email_verified) VALUES
('System Admin', 'admin@powerguard.in', '$2b$10$YourBcryptHashHere', '+91 98765 43210', 'admin', TRUE, TRUE),
('Rajesh Kumar', 'rajesh@consumer.com', '$2b$10$YourBcryptHashHere', '+91 87654 32109', 'consumer', TRUE, TRUE),
('Priya Sharma', 'priya@utility.com', '$2b$10$YourBcryptHashHere', '+91 76543 21098', 'utility', TRUE, TRUE);

INSERT INTO admins (user_id, admin_id, access_level) VALUES
(1, 'ADM-001', 'super');

INSERT INTO consumers (user_id, consumer_id, meter_id, area, address, connection_type) VALUES
(2, 'C-1001', 'MTR-001', 'Sector 15', 'A-12, Sector 15, Noida', 'residential');

INSERT INTO utility_officers (user_id, officer_id, department, designation, assigned_areas) VALUES
(3, 'OFF-001', 'Distribution', 'Junior Engineer', '["Sector 15", "Model Town", "Civil Lines"]');

INSERT INTO meters (meter_id, consumer_id, area, location_lat, location_lng, address, status, installed_date) VALUES
('MTR-001', 'C-1001', 'Sector 15', 28.6139, 77.2090, 'A-12, Sector 15, Noida', 'active', '2025-01-15'),
('MTR-002', 'C-1002', 'Model Town', 28.7041, 77.1025, 'B-45, Model Town', 'active', '2025-02-20'),
('MTR-003', 'C-1003', 'Civil Lines', 28.6829, 77.2210, 'C-78, Civil Lines', 'active', '2025-03-10'),
('MTR-047', 'C-1047', 'Sector 15', 28.6150, 77.2100, 'D-23, Sector 15', 'tampered', '2025-04-05'),
('MTR-089', 'C-1089', 'Civil Lines', 28.6840, 77.2230, 'E-56, Civil Lines', 'inactive', '2025-05-12');
