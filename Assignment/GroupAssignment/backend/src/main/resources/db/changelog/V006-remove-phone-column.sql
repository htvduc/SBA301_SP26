-- liquibase formatted sql

-- changeset system:remove-phone-column-from-users
ALTER TABLE users DROP COLUMN IF EXISTS phone;

-- rollback ALTER TABLE users ADD COLUMN phone VARCHAR(255);
