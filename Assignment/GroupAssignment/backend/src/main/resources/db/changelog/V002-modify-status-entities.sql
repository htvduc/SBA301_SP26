-- liquibase formatted sql

-- changeset hoahtm:1771356511464-16
ALTER TABLE refresh_token DROP CONSTRAINT fk_refresh_token_on_parent_refresh_token;

-- changeset hoahtm:1771356511464-17
ALTER TABLE refresh_token DROP COLUMN parent_refresh_token_id;
ALTER TABLE refresh_token DROP COLUMN revoked;

-- changeset hoahtm:1771356511464-1
ALTER TABLE area DROP COLUMN status;

-- changeset hoahtm:1771356511464-2
ALTER TABLE area
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-3
ALTER TABLE category DROP COLUMN status;

-- changeset hoahtm:1771356511464-4
ALTER TABLE category
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-5
ALTER TABLE customization DROP COLUMN status;

-- changeset hoahtm:1771356511464-6
ALTER TABLE customization
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-7
ALTER TABLE media DROP COLUMN status;

-- changeset hoahtm:1771356511464-8
ALTER TABLE media
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-9
ALTER TABLE order_item DROP COLUMN status;

-- changeset hoahtm:1771356511464-10
ALTER TABLE order_item
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-11
ALTER TABLE staff_account DROP COLUMN status;

-- changeset hoahtm:1771356511464-12
ALTER TABLE staff_account
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-13
ALTER TABLE users DROP COLUMN status;

-- changeset hoahtm:1771356511464-14
ALTER TABLE users
    ADD status VARCHAR(255);

-- changeset hoahtm:1771356511464-15
ALTER TABLE refresh_token
    ALTER COLUMN user_id SET NOT NULL;

