-- liquibase formatted sql

-- changeset phong:1710325400-1
CREATE TABLE promotion (
    promotion_id UUID NOT NULL,
    restaurant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(255),
    promotion_type VARCHAR(50) NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2),
    max_discount_value DECIMAL(10, 2),
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_promotion PRIMARY KEY (promotion_id),
    CONSTRAINT uc_promotion_code UNIQUE (code)
);

-- changeset phong:1710325400-2
CREATE TABLE promotion_menu_item (
    promotion_id UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    CONSTRAINT pk_promotion_menu_item PRIMARY KEY (promotion_id, menu_item_id)
);

-- changeset phong:1710325400-3
CREATE TABLE promotion_usage (
    promotion_usage_id UUID NOT NULL,
    promotion_id UUID NOT NULL,
    order_id UUID NOT NULL,
    used_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_promotion_usage PRIMARY KEY (promotion_usage_id)
);

-- changeset phong:1710325400-4
ALTER TABLE bill ADD COLUMN promotion_id UUID;
ALTER TABLE bill ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;

-- changeset phong:1710325400-5
ALTER TABLE promotion ADD CONSTRAINT FK_PROMOTION_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);
ALTER TABLE promotion_menu_item ADD CONSTRAINT FK_PROMENU_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotion (promotion_id);
ALTER TABLE promotion_menu_item ADD CONSTRAINT FK_PROMENU_ON_MENU_ITEM FOREIGN KEY (menu_item_id) REFERENCES menu_item (menu_item_id);
ALTER TABLE promotion_usage ADD CONSTRAINT FK_PROUSAGE_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotion (promotion_id);
ALTER TABLE promotion_usage ADD CONSTRAINT FK_PROUSAGE_ON_ORDER FOREIGN KEY (order_id) REFERENCES orders (order_id);
ALTER TABLE bill ADD CONSTRAINT FK_BILL_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotion (promotion_id);
