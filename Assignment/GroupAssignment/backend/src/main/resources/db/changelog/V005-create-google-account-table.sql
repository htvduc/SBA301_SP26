-- liquibase formatted sql

-- changeset hoahtm:create-google-account-table
CREATE TABLE google_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_sub VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_google_account_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);

-- changeset hoahtm:create-google-account-indexes
CREATE UNIQUE INDEX idx_google_account_sub 
    ON google_account(google_sub);

CREATE INDEX idx_google_account_user 
    ON google_account(user_id);