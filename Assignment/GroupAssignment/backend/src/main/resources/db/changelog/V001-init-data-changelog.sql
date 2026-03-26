-- liquibase formatted sql

-- changeset hoahtm:1769612173358-1
CREATE TABLE area
(
    area_id    UUID NOT NULL,
    branch_id  UUID NOT NULL,
    name       VARCHAR(255),
    status     BOOLEAN,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_area PRIMARY KEY (area_id)
);

-- changeset hoahtm:1769612173358-2
CREATE TABLE area_table
(
    area_table_id UUID NOT NULL,
    area_id       UUID NOT NULL,
    tag           VARCHAR(255),
    capacity      INTEGER,
    status        VARCHAR(255),
    qr            VARCHAR(255),
    created_at    TIMESTAMP WITHOUT TIME ZONE,
    updated_at    TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_area_table PRIMARY KEY (area_table_id)
);

-- changeset hoahtm:1769612173358-3
CREATE TABLE bill
(
    bill_id        UUID           NOT NULL,
    order_id       UUID,
    branch_id      UUID           NOT NULL,
    final_price    DECIMAL(10, 2) NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    note           VARCHAR(255),
    payment_method VARCHAR(255),
    paid_time      TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_bill PRIMARY KEY (bill_id)
);

-- changeset hoahtm:1769612173358-4
CREATE TABLE branch
(
    branch_id     UUID         NOT NULL,
    restaurant_id UUID         NOT NULL,
    address       VARCHAR(255) NOT NULL,
    branch_phone  VARCHAR(255),
    opening_time  time WITHOUT TIME ZONE NOT NULL,
    closing_time  time WITHOUT TIME ZONE NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE,
    updated_at    TIMESTAMP WITHOUT TIME ZONE,
    is_active     BOOLEAN,
    mail          VARCHAR(255) NOT NULL,
    CONSTRAINT pk_branch PRIMARY KEY (branch_id)
);

-- changeset hoahtm:1769612173358-5
CREATE TABLE branch_menu_item
(
    branch_menu_item_id UUID NOT NULL,
    branch_id           UUID NOT NULL,
    menu_item_id        UUID NOT NULL,
    is_available        BOOLEAN,
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_branch_menu_item PRIMARY KEY (branch_menu_item_id)
);

-- changeset hoahtm:1769612173358-6
CREATE TABLE branch_report
(
    branch_report_id UUID           NOT NULL,
    branch_id        UUID           NOT NULL,
    report_type      VARCHAR(255),
    create_date      TIMESTAMP WITHOUT TIME ZONE,
    total_order      INTEGER,
    completed_order  INTEGER,
    cancelled_order  INTEGER,
    total_revenue    DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_branch_report PRIMARY KEY (branch_report_id)
);

-- changeset hoahtm:1769612173358-7
CREATE TABLE category
(
    category_id   UUID NOT NULL,
    restaurant_id UUID,
    name          VARCHAR(255),
    status        BOOLEAN,
    created_at    TIMESTAMP WITHOUT TIME ZONE,
    updated_at    TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_category PRIMARY KEY (category_id)
);

-- changeset hoahtm:1769612173358-8
CREATE TABLE category_customization
(
    category_id      UUID NOT NULL,
    customization_id UUID NOT NULL,
    CONSTRAINT pk_category_customization PRIMARY KEY (category_id, customization_id)
);

-- changeset hoahtm:1769612173358-9
CREATE TABLE customization
(
    customization_id UUID           NOT NULL,
    restaurant_id    UUID           NOT NULL,
    name             VARCHAR(255),
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    status           BOOLEAN,
    price            DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_customization PRIMARY KEY (customization_id)
);

-- changeset hoahtm:1769612173358-10
CREATE TABLE feature
(
    feature_id  UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    code        VARCHAR(100),
    CONSTRAINT pk_feature PRIMARY KEY (feature_id)
);

-- changeset hoahtm:1769612173358-11
CREATE TABLE invalid_jwt_token
(
    id              VARCHAR(255) NOT NULL,
    expiration_time TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_invalid_jwt_token PRIMARY KEY (id)
);

-- changeset hoahtm:1769612173358-12
CREATE TABLE media
(
    media_id       UUID NOT NULL,
    target_id      UUID,
    target_type_id UUID NOT NULL,
    url            VARCHAR(255),
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    status         BOOLEAN,
    CONSTRAINT pk_media PRIMARY KEY (media_id)
);

-- changeset hoahtm:1769612173358-13
CREATE TABLE menu_item
(
    menu_item_id      UUID           NOT NULL,
    restaurant_id     UUID           NOT NULL,
    category_id       UUID           NOT NULL,
    has_customization BOOLEAN,
    name              VARCHAR(255),
    description       VARCHAR(255),
    price             DECIMAL(10, 2) NOT NULL,
    status            VARCHAR(255)   NOT NULL,
    is_bestseller     BOOLEAN,
    created_at        TIMESTAMP WITHOUT TIME ZONE,
    updated_at        TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_menu_item PRIMARY KEY (menu_item_id)
);

-- changeset hoahtm:1769612173358-14
CREATE TABLE menuitem_customization
(
    customization_id UUID NOT NULL,
    menu_item_id     UUID NOT NULL,
    CONSTRAINT pk_menuitem_customization PRIMARY KEY (customization_id, menu_item_id)
);

-- changeset hoahtm:1769612173358-15
CREATE TABLE order_item
(
    order_item_id UUID           NOT NULL,
    order_line_id UUID           NOT NULL,
    menu_item_id  UUID           NOT NULL,
    quantity      INTEGER,
    total_price   DECIMAL(10, 2) NOT NULL,
    note          VARCHAR(255),
    status        BOOLEAN,
    CONSTRAINT pk_order_item PRIMARY KEY (order_item_id)
);

-- changeset hoahtm:1769612173358-16
CREATE TABLE order_item_customization
(
    order_item_customization_id UUID           NOT NULL,
    order_item_id               UUID           NOT NULL,
    customization_id            UUID           NOT NULL,
    quantity                    INTEGER,
    total_price                 DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_order_item_customization PRIMARY KEY (order_item_customization_id)
);

-- changeset hoahtm:1769612173358-17
CREATE TABLE order_line
(
    order_line_id     UUID NOT NULL,
    order_id          UUID NOT NULL,
    total_price       DECIMAL(10, 2),
    order_line_status VARCHAR(255),
    created_at        TIMESTAMP WITHOUT TIME ZONE,
    updated_at        TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_order_line PRIMARY KEY (order_line_id)
);

-- changeset hoahtm:1769612173358-18
CREATE TABLE orders
(
    order_id      UUID           NOT NULL,
    area_table_id UUID           NOT NULL,
    status        VARCHAR(255),
    total_price   DECIMAL(10, 2) NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE,
    updated_at    TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_orders PRIMARY KEY (order_id)
);

-- changeset hoahtm:1769612173358-19
CREATE TABLE package_feature
(
    value      INTEGER,
    package_id UUID NOT NULL,
    feature_id UUID NOT NULL,
    CONSTRAINT pk_package_feature PRIMARY KEY (package_id, feature_id)
);

-- changeset hoahtm:1769612173358-20
CREATE TABLE packages
(
    package_id     UUID         NOT NULL,
    name           VARCHAR(255) NOT NULL,
    price          INTEGER      NOT NULL,
    description    VARCHAR(255),
    is_available   BOOLEAN      NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    billing_period INTEGER      NOT NULL,
    CONSTRAINT pk_packages PRIMARY KEY (package_id)
);

-- changeset hoahtm:1769612173358-21
CREATE TABLE refresh_token
(
    id                      VARCHAR(255) NOT NULL,
    token_hash              VARCHAR(128) NOT NULL,
    user_id                 UUID,
    issued_at               TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    expires_at              TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked                 BOOLEAN      NOT NULL,
    client_ip               VARCHAR(255),
    user_agent              VARCHAR(255),
    parent_refresh_token_id VARCHAR(255),
    staff_account_id        UUID,
    CONSTRAINT pk_refresh_token PRIMARY KEY (id)
);

-- changeset hoahtm:1769612173358-22
CREATE TABLE reservation
(
    reservation_id UUID NOT NULL,
    branch_id      UUID NOT NULL,
    area_table_id  UUID,
    start_time     TIMESTAMP WITHOUT TIME ZONE,
    customer_name  VARCHAR(255),
    customer_phone VARCHAR(255),
    customer_email VARCHAR(255),
    guest_number   INTEGER,
    note           VARCHAR(255),
    status         VARCHAR(255),
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_reservation PRIMARY KEY (reservation_id)
);

-- changeset hoahtm:1769612173358-23
CREATE TABLE restaurant
(
    restaurant_id    UUID         NOT NULL,
    user_id          UUID         NOT NULL,
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255),
    status           BOOLEAN,
    restaurant_phone VARCHAR(255),
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    public_url       VARCHAR(255),
    description      VARCHAR(255),
    CONSTRAINT pk_restaurant PRIMARY KEY (restaurant_id)
);

-- changeset hoahtm:1769612173358-24
CREATE TABLE restaurant_report
(
    restaurant_report_id UUID           NOT NULL,
    restaurant_id        UUID           NOT NULL,
    report_type          VARCHAR(255),
    create_date          TIMESTAMP WITHOUT TIME ZONE,
    total_branches       INTEGER,
    total_order          INTEGER,
    completed_order      INTEGER,
    cancelled_order      INTEGER,
    total_revenue        DECIMAL(10, 2) NOT NULL,
    avg_revenue          DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_restaurant_report PRIMARY KEY (restaurant_report_id)
);

-- changeset hoahtm:1769612173358-25
CREATE TABLE role
(
    role_id     UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_role PRIMARY KEY (role_id)
);

-- changeset hoahtm:1769612173358-26
CREATE TABLE staff_account
(
    staff_account_id UUID         NOT NULL,
    role_id          UUID         NOT NULL,
    branch_id        UUID         NOT NULL,
    username         VARCHAR(255) NOT NULL,
    password         VARCHAR(255) NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    status           BOOLEAN,
    CONSTRAINT pk_staff_account PRIMARY KEY (staff_account_id)
);

-- changeset hoahtm:1769612173358-27
CREATE TABLE subscription
(
    subscription_id UUID         NOT NULL,
    restaurant_id   UUID         NOT NULL,
    package_id      UUID         NOT NULL,
    status          VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITHOUT TIME ZONE,
    updated_at      TIMESTAMP WITHOUT TIME ZONE,
    start_date      date,
    end_date        date,
    CONSTRAINT pk_subscription PRIMARY KEY (subscription_id)
);

-- changeset hoahtm:1769612173358-28
CREATE TABLE subscription_payment
(
    subscription_payment_id     UUID         NOT NULL,
    subscription_id             UUID         NOT NULL,
    amount                      INTEGER      NOT NULL,
    payos_order_code            BIGINT,
    payos_transaction_code      VARCHAR(255),
    qr_code_url                 VARCHAR(255),
    account_number              VARCHAR(255),
    account_name                VARCHAR(255),
    expired_at                  TIMESTAMP WITHOUT TIME ZONE,
    subscription_payment_status VARCHAR(255),
    response_payload            OID,
    webhook_payload             OID,
    webhook_status              BOOLEAN,
    is_signature_verified       BOOLEAN,
    date                        TIMESTAMP WITHOUT TIME ZONE,
    description                 VARCHAR(255),
    purpose                     VARCHAR(255) NOT NULL,
    target_package_id           UUID,
    prorated_amount             INTEGER,
    CONSTRAINT pk_subscription_payment PRIMARY KEY (subscription_payment_id)
);

-- changeset hoahtm:1769612173358-29
CREATE TABLE target_type
(
    target_type_id UUID NOT NULL,
    code           VARCHAR(255),
    CONSTRAINT pk_target_type PRIMARY KEY (target_type_id)
);

-- changeset hoahtm:1769612173358-30
CREATE TABLE users
(
    user_id    UUID         NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    google_id  VARCHAR(255),
    username   VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    phone      VARCHAR(255),
    status     BOOLEAN,
    role_id    UUID         NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id)
);

-- changeset hoahtm:1769612173358-31
ALTER TABLE bill
    ADD CONSTRAINT uc_bill_order UNIQUE (order_id);

-- changeset hoahtm:1769612173358-32
ALTER TABLE branch
    ADD CONSTRAINT uc_branch_address UNIQUE (address);

-- changeset hoahtm:1769612173358-33
ALTER TABLE branch
    ADD CONSTRAINT uc_branch_mail UNIQUE (mail);

-- changeset hoahtm:1769612173358-34
ALTER TABLE feature
    ADD CONSTRAINT uc_feature_code UNIQUE (code);

-- changeset hoahtm:1769612173358-35
ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);

-- changeset hoahtm:1769612173358-36
ALTER TABLE area
    ADD CONSTRAINT FK_AREA_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-37
ALTER TABLE area_table
    ADD CONSTRAINT FK_AREA_TABLE_ON_AREA FOREIGN KEY (area_id) REFERENCES area (area_id);

-- changeset hoahtm:1769612173358-38
ALTER TABLE bill
    ADD CONSTRAINT FK_BILL_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-39
ALTER TABLE bill
    ADD CONSTRAINT FK_BILL_ON_ORDER FOREIGN KEY (order_id) REFERENCES orders (order_id);

-- changeset hoahtm:1769612173358-40
ALTER TABLE branch_menu_item
    ADD CONSTRAINT FK_BRANCH_MENU_ITEM_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-41
ALTER TABLE branch_menu_item
    ADD CONSTRAINT FK_BRANCH_MENU_ITEM_ON_MENU_ITEM FOREIGN KEY (menu_item_id) REFERENCES menu_item (menu_item_id);

-- changeset hoahtm:1769612173358-42
ALTER TABLE branch
    ADD CONSTRAINT FK_BRANCH_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-43
ALTER TABLE branch_report
    ADD CONSTRAINT FK_BRANCH_REPORT_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-44
ALTER TABLE category
    ADD CONSTRAINT FK_CATEGORY_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-45
ALTER TABLE customization
    ADD CONSTRAINT FK_CUSTOMIZATION_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-46
ALTER TABLE media
    ADD CONSTRAINT FK_MEDIA_ON_TARGET_TYPE FOREIGN KEY (target_type_id) REFERENCES target_type (target_type_id);

-- changeset hoahtm:1769612173358-47
ALTER TABLE menu_item
    ADD CONSTRAINT FK_MENU_ITEM_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES category (category_id);

-- changeset hoahtm:1769612173358-48
ALTER TABLE menu_item
    ADD CONSTRAINT FK_MENU_ITEM_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-49
ALTER TABLE orders
    ADD CONSTRAINT FK_ORDERS_ON_AREA_TABLE FOREIGN KEY (area_table_id) REFERENCES area_table (area_table_id);

-- changeset hoahtm:1769612173358-50
ALTER TABLE order_item_customization
    ADD CONSTRAINT FK_ORDER_ITEM_CUSTOMIZATION_ON_CUSTOMIZATION FOREIGN KEY (customization_id) REFERENCES customization (customization_id);

-- changeset hoahtm:1769612173358-51
ALTER TABLE order_item_customization
    ADD CONSTRAINT FK_ORDER_ITEM_CUSTOMIZATION_ON_ORDER_ITEM FOREIGN KEY (order_item_id) REFERENCES order_item (order_item_id);

-- changeset hoahtm:1769612173358-52
ALTER TABLE order_item
    ADD CONSTRAINT FK_ORDER_ITEM_ON_MENU_ITEM FOREIGN KEY (menu_item_id) REFERENCES menu_item (menu_item_id);

-- changeset hoahtm:1769612173358-53
ALTER TABLE order_item
    ADD CONSTRAINT FK_ORDER_ITEM_ON_ORDER_LINE FOREIGN KEY (order_line_id) REFERENCES order_line (order_line_id);

-- changeset hoahtm:1769612173358-54
ALTER TABLE order_line
    ADD CONSTRAINT FK_ORDER_LINE_ON_ORDER FOREIGN KEY (order_id) REFERENCES orders (order_id);

-- changeset hoahtm:1769612173358-55
ALTER TABLE package_feature
    ADD CONSTRAINT FK_PACKAGE_FEATURE_ON_FEATURE FOREIGN KEY (feature_id) REFERENCES feature (feature_id);

-- changeset hoahtm:1769612173358-56
ALTER TABLE package_feature
    ADD CONSTRAINT FK_PACKAGE_FEATURE_ON_PACKAGE FOREIGN KEY (package_id) REFERENCES packages (package_id);

-- changeset hoahtm:1769612173358-57
ALTER TABLE refresh_token
    ADD CONSTRAINT FK_REFRESH_TOKEN_ON_PARENT_REFRESH_TOKEN FOREIGN KEY (parent_refresh_token_id) REFERENCES refresh_token (id);

-- changeset hoahtm:1769612173358-58
ALTER TABLE refresh_token
    ADD CONSTRAINT FK_REFRESH_TOKEN_ON_STAFF_ACCOUNT FOREIGN KEY (staff_account_id) REFERENCES staff_account (staff_account_id);

-- changeset hoahtm:1769612173358-59
ALTER TABLE refresh_token
    ADD CONSTRAINT FK_REFRESH_TOKEN_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

-- changeset hoahtm:1769612173358-60
ALTER TABLE reservation
    ADD CONSTRAINT FK_RESERVATION_ON_AREA_TABLE FOREIGN KEY (area_table_id) REFERENCES area_table (area_table_id);

-- changeset hoahtm:1769612173358-61
ALTER TABLE reservation
    ADD CONSTRAINT FK_RESERVATION_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-62
ALTER TABLE restaurant
    ADD CONSTRAINT FK_RESTAURANT_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

-- changeset hoahtm:1769612173358-63
ALTER TABLE restaurant_report
    ADD CONSTRAINT FK_RESTAURANT_REPORT_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-64
ALTER TABLE staff_account
    ADD CONSTRAINT FK_STAFF_ACCOUNT_ON_BRANCH FOREIGN KEY (branch_id) REFERENCES branch (branch_id);

-- changeset hoahtm:1769612173358-65
ALTER TABLE staff_account
    ADD CONSTRAINT FK_STAFF_ACCOUNT_ON_ROLE FOREIGN KEY (role_id) REFERENCES role (role_id);

-- changeset hoahtm:1769612173358-66
ALTER TABLE subscription
    ADD CONSTRAINT FK_SUBSCRIPTION_ON_PACKAGE FOREIGN KEY (package_id) REFERENCES packages (package_id);

-- changeset hoahtm:1769612173358-67
ALTER TABLE subscription
    ADD CONSTRAINT FK_SUBSCRIPTION_ON_RESTAURANT FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id);

-- changeset hoahtm:1769612173358-68
ALTER TABLE subscription_payment
    ADD CONSTRAINT FK_SUBSCRIPTION_PAYMENT_ON_SUBSCRIPTION FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id);

-- changeset hoahtm:1769612173358-69
ALTER TABLE subscription_payment
    ADD CONSTRAINT FK_SUBSCRIPTION_PAYMENT_ON_TARGET_PACKAGE FOREIGN KEY (target_package_id) REFERENCES packages (package_id);

-- changeset hoahtm:1769612173358-70
ALTER TABLE users
    ADD CONSTRAINT FK_USERS_ON_ROLE FOREIGN KEY (role_id) REFERENCES role (role_id);

-- changeset hoahtm:1769612173358-71
ALTER TABLE category_customization
    ADD CONSTRAINT fk_catcus_on_category FOREIGN KEY (category_id) REFERENCES category (category_id);

-- changeset hoahtm:1769612173358-72
ALTER TABLE category_customization
    ADD CONSTRAINT fk_catcus_on_customization FOREIGN KEY (customization_id) REFERENCES customization (customization_id);

-- changeset hoahtm:1769612173358-73
ALTER TABLE menuitem_customization
    ADD CONSTRAINT fk_mencus_on_customization FOREIGN KEY (customization_id) REFERENCES customization (customization_id);

-- changeset hoahtm:1769612173358-74
ALTER TABLE menuitem_customization
    ADD CONSTRAINT fk_mencus_on_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_item (menu_item_id);

