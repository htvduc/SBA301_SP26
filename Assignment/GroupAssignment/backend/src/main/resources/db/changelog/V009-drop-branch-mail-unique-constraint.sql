-- liquibase formatted sql

-- changeset kiro:drop-branch-mail-unique-constraint
ALTER TABLE branch DROP CONSTRAINT IF EXISTS uc_branch_mail;
