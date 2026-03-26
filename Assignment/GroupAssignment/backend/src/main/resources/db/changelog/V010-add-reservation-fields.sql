-- liquibase formatted sql

-- changeset hoahtm:1771356511464-18
ALTER TABLE reservation
    ADD COLUMN arrival_time TIMESTAMP WITHOUT TIME ZONE;

-- changeset hoahtm:1771356511464-19
ALTER TABLE reservation
    ADD COLUMN completion_time TIMESTAMP WITHOUT TIME ZONE;

-- changeset hoahtm:1771356511464-20
ALTER TABLE reservation
    ADD COLUMN rejection_reason VARCHAR(255);
