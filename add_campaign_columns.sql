-- Add missing columns to campaigns table
ALTER TABLE `campaigns` 
ADD COLUMN `sentCount` INT NOT NULL DEFAULT 0,
ADD COLUMN `openRate` FLOAT NOT NULL DEFAULT 0;
