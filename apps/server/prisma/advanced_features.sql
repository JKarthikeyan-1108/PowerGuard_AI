-- ==============================================================================
-- PowerGuard Advanced Database Features
-- Views, Stored Procedures, Triggers, and Audit Tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUDIT TABLES
-- ------------------------------------------------------------------------------

-- Shadow audit table for meters
CREATE TABLE IF NOT EXISTS `meters_audit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meterId` VARCHAR(191) NOT NULL,
  `oldStatus` VARCHAR(191),
  `newStatus` VARCHAR(191),
  `action` VARCHAR(50) NOT NULL,
  `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

-- Shadow audit table for users
CREATE TABLE IF NOT EXISTS `users_audit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `oldRole` VARCHAR(191),
  `newRole` VARCHAR(191),
  `oldStatus` VARCHAR(191),
  `newStatus` VARCHAR(191),
  `action` VARCHAR(50) NOT NULL,
  `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

-- ------------------------------------------------------------------------------
-- 2. VIEWS
-- ------------------------------------------------------------------------------

-- View: Daily consumption per meter
CREATE OR REPLACE VIEW `v_daily_meter_consumption` AS
SELECT 
  `meterId`,
  DATE(`timestamp`) AS `readingDate`,
  SUM(`value`) AS `totalDailyConsumption`,
  MAX(`value`) AS `peakHourlyConsumption`
FROM `meter_readings`
GROUP BY `meterId`, DATE(`timestamp`);

-- View: Active theft alerts overview
CREATE OR REPLACE VIEW `v_active_theft_alerts` AS
SELECT 
  a.`id` AS `alertId`,
  a.`severity`,
  a.`title`,
  a.`createdAt`,
  m.`serialNumber`,
  c.`accountNumber`,
  u.`email`
FROM `alerts` a
JOIN `meters` m ON a.`meterId` = m.`id`
JOIN `consumer_profiles` c ON m.`consumerId` = c.`id`
JOIN `users` u ON c.`userId` = u.`id`
WHERE a.`type` = 'THEFT_DETECTED' AND a.`status` IN ('NEW', 'INVESTIGATING');

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS
-- ------------------------------------------------------------------------------

DELIMITER $$

-- Trigger: Update lastReadingAt on meter when a new reading is inserted
DROP TRIGGER IF EXISTS `trg_after_reading_insert`$$
CREATE TRIGGER `trg_after_reading_insert`
AFTER INSERT ON `meter_readings`
FOR EACH ROW
BEGIN
  UPDATE `meters`
  SET `lastReadingAt` = NEW.`timestamp`
  WHERE `id` = NEW.`meterId`;
END$$

-- Trigger: Log meter status changes to audit table
DROP TRIGGER IF EXISTS `trg_meters_audit_update`$$
CREATE TRIGGER `trg_meters_audit_update`
AFTER UPDATE ON `meters`
FOR EACH ROW
BEGIN
  IF OLD.`status` != NEW.`status` THEN
    INSERT INTO `meters_audit` (`meterId`, `oldStatus`, `newStatus`, `action`)
    VALUES (NEW.`id`, OLD.`status`, NEW.`status`, 'STATUS_CHANGE');
  END IF;
END$$

-- Trigger: Log user role/status changes to audit table
DROP TRIGGER IF EXISTS `trg_users_audit_update`$$
CREATE TRIGGER `trg_users_audit_update`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
  IF OLD.`role` != NEW.`role` OR OLD.`status` != NEW.`status` THEN
    INSERT INTO `users_audit` (`userId`, `oldRole`, `newRole`, `oldStatus`, `newStatus`, `action`)
    VALUES (NEW.`id`, OLD.`role`, NEW.`role`, OLD.`status`, NEW.`status`, 'ROLE_OR_STATUS_CHANGE');
  END IF;
END$$

DELIMITER ;

-- ------------------------------------------------------------------------------
-- 4. STORED PROCEDURES
-- ------------------------------------------------------------------------------

DELIMITER $$

-- Procedure: Calculate a consumer's bill for a specific month
DROP PROCEDURE IF EXISTS `sp_calculate_monthly_bill`$$
CREATE PROCEDURE `sp_calculate_monthly_bill`(
  IN p_consumerId VARCHAR(191), 
  IN p_year INT, 
  IN p_month INT,
  OUT p_totalAmount FLOAT
)
BEGIN
  DECLARE v_tariffRate FLOAT;
  DECLARE v_totalConsumption FLOAT;

  -- Get tariff rate
  SELECT `tariffRate` INTO v_tariffRate
  FROM `consumer_profiles`
  WHERE `id` = p_consumerId;

  -- Calculate total consumption for the month
  SELECT SUM(r.`value`) INTO v_totalConsumption
  FROM `meter_readings` r
  JOIN `meters` m ON r.`meterId` = m.`id`
  WHERE m.`consumerId` = p_consumerId
    AND YEAR(r.`timestamp`) = p_year
    AND MONTH(r.`timestamp`) = p_month;

  -- Calculate total amount
  IF v_totalConsumption IS NULL THEN
    SET p_totalAmount = 0;
  ELSE
    SET p_totalAmount = v_totalConsumption * v_tariffRate;
  END IF;
END$$

DELIMITER ;
