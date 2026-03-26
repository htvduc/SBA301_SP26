-- liquibase formatted sql

-- changeset phong:1710590000-1
ALTER TABLE order_item ADD COLUMN unit_price DECIMAL(10, 2);
ALTER TABLE order_item ADD COLUMN discounted_unit_price DECIMAL(10, 2);


-- changeset phong:1710590000-2
ALTER TABLE order_item ALTER COLUMN unit_price SET NOT NULL;
ALTER TABLE order_item ALTER COLUMN discounted_unit_price SET NOT NULL;

