-- liquibase formatted sql

-- changeset hoahtm:1709800000000-1
INSERT INTO feature (feature_id, name, description, code) VALUES
                                                              (gen_random_uuid(), 'Menu Items Limit', 'Maximum number of menu items allowed', 'LIMIT_MENU_ITEMS'),
                                                              (gen_random_uuid(), 'Branch Creation Limit', 'Maximum number of branches allowed', 'LIMIT_BRANCH_CREATION'),
                                                              (gen_random_uuid(), 'Customization Per Category Limit', 'Maximum customizations per category', 'LIMIT_CUSTOMIZATION_PER_CATEGORY'),
                                                              (gen_random_uuid(), 'Unlimited Branch Creation', 'Create unlimited branches', 'UNLIMITED_BRANCH_CREATION')
    ON CONFLICT (code) DO NOTHING;


-- changeset hoahtm:1709800000000-2 splitStatements:false
DO $$
DECLARE
standard_pkg_id UUID;
    premium_pkg_id UUID;

    limit_menu_items_id UUID;
    limit_branch_id UUID;
    limit_customization_id UUID;
    unlimited_branch_id UUID;

    email_support_id UUID;
    priority_support_id UUID;
    dedicated_support_id UUID;
    basic_analytics_id UUID;
    advanced_analytics_id UUID;
    custom_branding_id UUID;
BEGIN

INSERT INTO packages (package_id, name, description, price, is_available, billing_period, created_at, updated_at)
VALUES (gen_random_uuid(), 'Standard', 'Basic package for small and medium restaurants', 3000, true, 1, NOW(), NOW())
    RETURNING package_id INTO standard_pkg_id;

INSERT INTO packages (package_id, name, description, price, is_available, billing_period, created_at, updated_at)
VALUES (gen_random_uuid(), 'Premium', 'Premium package for restaurant chains', 10000, true, 1, NOW(), NOW())
    RETURNING package_id INTO premium_pkg_id;

SELECT feature_id INTO limit_menu_items_id FROM feature WHERE code='LIMIT_MENU_ITEMS';
SELECT feature_id INTO limit_branch_id FROM feature WHERE code='LIMIT_BRANCH_CREATION';
SELECT feature_id INTO limit_customization_id FROM feature WHERE code='LIMIT_CUSTOMIZATION_PER_CATEGORY';
SELECT feature_id INTO unlimited_branch_id FROM feature WHERE code='UNLIMITED_BRANCH_CREATION';

INSERT INTO package_feature (package_id, feature_id, value) VALUES
                                                                (standard_pkg_id, limit_menu_items_id, 5),
                                                                (standard_pkg_id, limit_branch_id, 3),
                                                                (standard_pkg_id, limit_customization_id, 10);

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Email Support', '24/7 email support')
    RETURNING feature_id INTO email_support_id;

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Priority Support', 'Priority email and chat support')
    RETURNING feature_id INTO priority_support_id;

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Dedicated Support', 'Dedicated account manager')
    RETURNING feature_id INTO dedicated_support_id;

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Basic Analytics', 'View basic order analytics')
    RETURNING feature_id INTO basic_analytics_id;

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Advanced Analytics', 'Detailed revenue and order analytics')
    RETURNING feature_id INTO advanced_analytics_id;

INSERT INTO feature (feature_id, name, description)
VALUES (gen_random_uuid(), 'Custom Branding', 'White-label solution')
    RETURNING feature_id INTO custom_branding_id;

INSERT INTO package_feature (package_id, feature_id, value) VALUES
                                                                (standard_pkg_id, email_support_id, 0),
                                                                (standard_pkg_id, basic_analytics_id, 0);

INSERT INTO package_feature (package_id, feature_id, value) VALUES
                                                                (premium_pkg_id, dedicated_support_id, 0),
                                                                (premium_pkg_id, advanced_analytics_id, 0),
                                                                (premium_pkg_id, custom_branding_id, 0);

END $$;