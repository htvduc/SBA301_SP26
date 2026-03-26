-- liquibase formatted sql

-- changeset kiro:1711000000000-9

-- Drop index trước khi đổi dimension (bắt buộc)
DROP INDEX IF EXISTS idx_conversation_vectors_user_embedding;

-- Alter column dimension từ 1536 → 1024
ALTER TABLE conversation_vectors
    ALTER COLUMN user_message_embedding TYPE vector(1024),
    ALTER COLUMN ai_response_embedding TYPE vector(1024);

-- Recreate index với dimension mới
CREATE INDEX idx_conversation_vectors_user_embedding 
    ON conversation_vectors 
    USING ivfflat (user_message_embedding vector_cosine_ops)
    WITH (lists = 100);