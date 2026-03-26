-- liquibase formatted sql

-- changeset hoahtm:seed-target-type-data
INSERT INTO public.target_type (target_type_id, code)
VALUES
    ('abc11111-1111-1111-1111-111111111111', 'USER_AVATAR'),
    ('abc22222-2222-2222-2222-222222222222', 'RESTAURANT_AVATAR'),
    ('abc33333-3333-3333-3333-333333333333', 'MENU_ITEM_IMAGE')
ON CONFLICT (target_type_id) DO NOTHING;