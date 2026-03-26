-- liquibase formatted sql

-- changeset kiro:1711000000000-3
CREATE EXTENSION IF NOT EXISTS vector;

-- changeset kiro:1711000000000-4
CREATE TABLE conversation_vectors (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL,
    branch_id UUID,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_message_embedding vector(1536),
    ai_response_embedding vector(1536),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB,
    
    CONSTRAINT fk_conversation_vectors_restaurant FOREIGN KEY (restaurant_id) 
        REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_vectors_branch FOREIGN KEY (branch_id) 
        REFERENCES branch(branch_id) ON DELETE CASCADE
);

-- changeset kiro:1711000000000-5
CREATE INDEX idx_conversation_vectors_restaurant 
    ON conversation_vectors(restaurant_id);

-- changeset kiro:1711000000000-6
CREATE INDEX idx_conversation_vectors_branch 
    ON conversation_vectors(branch_id);

-- changeset kiro:1711000000000-7
CREATE INDEX idx_conversation_vectors_session 
    ON conversation_vectors(session_id);

-- changeset kiro:1711000000000-8
CREATE INDEX idx_conversation_vectors_user_embedding 
    ON conversation_vectors USING ivfflat (user_message_embedding vector_cosine_ops)
    WITH (lists = 100);
