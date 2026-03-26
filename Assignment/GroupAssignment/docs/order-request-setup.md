# Order request (customer QR → waiter)

## Database

Nếu `spring.liquibase.enabled: false`, chạy thủ công nội dung file:

`backend/src/main/resources/db/changelog/V010-order-request.sql`

trên PostgreSQL (cùng DB với app).

Hoặc bật Liquibase tạm thời để áp changelog.

## API

- **Customer (QR):** `POST /api/customer/order-requests` — body giống `CreateOrderRequest` (`areaTableId` + `items`).
- **Waiter:**
  - `GET /api/waiter/order-requests/branch/{branchId}/pending`
  - `POST /api/waiter/order-requests/{id}/accept` → thêm món vào order bàn (tạo order hoặc add line).
  - `POST /api/waiter/order-requests/{id}/reject`

## Waiter UI

Route: **Requests** (`/waiter/requests`) trong sidebar waiter.
