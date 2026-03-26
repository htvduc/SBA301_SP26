-- liquibase formatted sql

-- changeset kiro:1709784000000-1
-- Alter area_table.qr column from VARCHAR(255) to TEXT to store base64 QR code images
ALTER TABLE area_table ALTER COLUMN qr TYPE TEXT;

-- rollback ALTER TABLE area_table ALTER COLUMN qr TYPE VARCHAR(255);
