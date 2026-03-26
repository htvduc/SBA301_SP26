-- liquibase formatted sql

-- changeset system:015-make-refresh-token-user-id-nullable
-- comment: Make user_id column nullable in refresh_token table to support staff account tokens

ALTER TABLE refresh_token
ALTER COLUMN user_id DROP NOT NULL;

-- rollback ALTER TABLE refresh_token ALTER COLUMN user_id SET NOT NULL;
