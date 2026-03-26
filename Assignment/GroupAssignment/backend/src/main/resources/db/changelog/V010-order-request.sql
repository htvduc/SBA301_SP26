-- liquibase formatted sql

-- changeset rms:order-request-1
CREATE TABLE order_request
(
    order_request_id UUID                     NOT NULL,
    area_table_id    UUID                     NOT NULL,
    branch_id        UUID                     NOT NULL,
    status           VARCHAR(50)              NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_order_request PRIMARY KEY (order_request_id),
    CONSTRAINT fk_or_area_table FOREIGN KEY (area_table_id) REFERENCES area_table (area_table_id),
    CONSTRAINT fk_or_branch FOREIGN KEY (branch_id) REFERENCES branch (branch_id)
);

CREATE TABLE order_request_item
(
    order_request_item_id UUID                     NOT NULL,
    order_request_id      UUID                     NOT NULL,
    menu_item_id          UUID                     NOT NULL,
    quantity              INTEGER                  NOT NULL,
    note                  VARCHAR(500),
    total_price           DECIMAL(10, 2)           NOT NULL,
    CONSTRAINT pk_order_request_item PRIMARY KEY (order_request_item_id),
    CONSTRAINT fk_ori_request FOREIGN KEY (order_request_id) REFERENCES order_request (order_request_id) ON DELETE CASCADE,
    CONSTRAINT fk_ori_menu FOREIGN KEY (menu_item_id) REFERENCES menu_item (menu_item_id)
);

CREATE TABLE order_request_item_customization
(
    order_request_item_customization_id UUID           NOT NULL,
    order_request_item_id               UUID           NOT NULL,
    customization_id                    UUID           NOT NULL,
    quantity                            INTEGER        NOT NULL,
    total_price                         DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_oric PRIMARY KEY (order_request_item_customization_id),
    CONSTRAINT fk_oric_item FOREIGN KEY (order_request_item_id) REFERENCES order_request_item (order_request_item_id) ON DELETE CASCADE,
    CONSTRAINT fk_oric_cust FOREIGN KEY (customization_id) REFERENCES customization (customization_id)
);
