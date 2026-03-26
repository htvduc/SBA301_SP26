-- liquibase formatted sql

-- changeset kiro:1711000000000-1
INSERT INTO feature (feature_id, name, description, code) 
VALUES (gen_random_uuid(), 'AI Business Consultant', 'Access to AI-powered business analytics consultant', 'AI_ASSISTANT')
ON CONFLICT (code) DO NOTHING;

-- changeset kiro:1711000000000-2 splitStatements:false
DO $$
DECLARE
    premium_pkg_id UUID;
    ai_assistant_id UUID;
BEGIN
    SELECT package_id INTO premium_pkg_id FROM packages WHERE name = 'Premium' LIMIT 1;
    SELECT feature_id INTO ai_assistant_id FROM feature WHERE code = 'AI_ASSISTANT';
    
    IF premium_pkg_id IS NOT NULL AND ai_assistant_id IS NOT NULL THEN
        INSERT INTO package_feature (package_id, feature_id, value)
        VALUES (premium_pkg_id, ai_assistant_id, 0)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
