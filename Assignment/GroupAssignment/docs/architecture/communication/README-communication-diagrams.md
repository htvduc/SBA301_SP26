# Đề xuất Communication Diagram (UML)

Communication diagram (collaboration diagram) thể hiện **tương tác giữa các object** với **số thứ tự message** trên từng link, nhấn mạnh cấu trúc object và quan hệ liên kết. Thông tin tương đương sequence diagram nhưng bố cục theo object.

**Lưu ý:** PlantUML không có type "communication diagram" riêng. Có thể:
- Dùng **sequence diagram** (đã có trong `../sequence/`) — cùng nội dung, khác cách trình bày.
- Vẽ bằng công cụ hỗ trợ communication (StarUML, draw.io, Enterprise Architect, v.v.) theo danh sách dưới đây.
- Tham khảo **component communication** trong folder này (PlantUML component diagram thể hiện giao tiếp giữa Controller–Service–Repository).

---

## 1. Luồng đã có sequence diagram tương ứng (có thể chuyển sang communication view)

| # | Use case | Objects / Participants | Ghi chú |
|---|----------|------------------------|--------|
| 1 | **Auth – Register** | Client, AuthenticationController, AuthenticationService, UserRepository, RoleRepository, PasswordEncoder, DB | `auth-registration-sequence.puml` |
| 2 | **Auth – Login** | Client, AuthenticationController, AuthenticationService, UserRepository, JwtService, RefreshTokenRepository, PasswordEncoder, DB | `auth-login-sequence.puml` |
| 3 | **Auth – Logout** | Client, AuthenticationController, AuthenticationService, RefreshTokenRepository, DB | `auth-logout-sequence.puml` |
| 4 | **Auth – Forgot password** | Client, AuthenticationController, AuthenticationService, UserRepository, MailService, DB | `auth-forgot-password-sequence.puml` |
| 5 | **Create restaurant** | Client, RestaurantController, RestaurantService, UserRepository, RestaurantRepository, DB | `restaurant-create-sequence.puml` |
| 6 | **Create branch** | Client, BranchController, BranchService, RestaurantRepository, BranchRepository, DB | `branch-create-sequence.puml` |
| 7 | **Assign branch manager** | Client, StaffAccountController (hoặc BranchController), Service, StaffAccountRepository, BranchRepository, DB | `assign-branch-manager-sequence.puml` |
| 8 | **Create staff** | Client, StaffAccountController, StaffAccountService, BranchRepository, StaffAccountRepository, UserRepository, DB | `staff-create-sequence.puml` |
| 9 | **Disable staff** | Client, StaffAccountController, StaffAccountService, StaffAccountRepository, DB | `staff-disable-sequence.puml` |
| 10 | **Create category** | Client, CategoryController, CategoryService, CategoryRepository, DB | `category-create-sequence.puml` |
| 11 | **Create menu item** | Client, MenuItemController, MenuItemService, CategoryRepository, MenuItemRepository, MediaService, DB | `menu-item-create-sequence.puml` |
| 12 | **Create customization** | Client, CustomizationController, CustomizationService, CategoryRepository, CustomizationRepository, DB | `customization-create-sequence.puml` |
| 13 | **Create order** | Waiter, WaiterOrderController, OrderService, AreaTableRepository, OrderRepository, OrderLineRepository, OrderItemRepository, DB | `order-create-sequence.puml` |
| 14 | **Add items to order** | Waiter, WaiterOrderController, OrderService, OrderRepository, OrderLineRepository, MenuItemRepository, OrderItemRepository, DB | `order-add-items-sequence.puml` |
| 15 | **Confirm payment** | Receptionist, WaiterBillController, BillService, OrderRepository, BranchRepository, AreaTableRepository, BillRepository, DB | `confirm-payment-sequence.puml` |
| 16 | **Create bill** | (nếu tách riêng) | `bill-create-sequence.puml` |
| 17 | **Purchase subscription** | Owner, RestaurantSubscriptionController, RestaurantSubscriptionService, RestaurantService, SubscriptionService, SubscriptionPaymentService, PayOS, DB | `purchase-subscription-sequence.puml` |
| 18 | **Subscription plan create** | Admin, PackageController, PackageService, ... | `subscription-plan-create-sequence.puml` |

Với mỗi luồng trên, lấy **thứ tự message** từ sequence diagram tương ứng, đánh số 1, 2, 3, 2.1, 2.2... và gắn lên **link** giữa hai object trong communication diagram.

---

## 2. Luồng đã có trong source nhưng chưa có sequence diagram

| # | Use case | Objects gợi ý | Controller / Service |
|---|----------|----------------|----------------------|
| 19 | **Cập nhật / xóa order item** | Waiter, WaiterOrderController, OrderService, OrderItemRepository, OrderRepository | `OrderService.updateOrderItem`, `removeOrderItem` |
| 20 | **Hủy order** | Waiter, WaiterOrderController, OrderService, OrderRepository, AreaTableRepository | `OrderService.cancelOrder` |
| 21 | **Đổi trạng thái bàn** | Owner/Staff, AreaTableController / WaiterTableController, AreaTableService, AreaTableRepository | `setStatus`, `markOccupied`, `markAvailable`, `markOutOfOrder` |
| 22 | **Gia hạn / nâng cấp subscription** | Owner, RestaurantSubscriptionController, RestaurantSubscriptionService, SubscriptionPaymentService, SubscriptionRepository | `renewSubscription`, `upgradePackage` |
| 23 | **Hủy subscription** | Owner, SubscriptionController, SubscriptionService, SubscriptionRepository, RestaurantRepository | `cancelSubscription` |
| 24 | **Webhook PayOS (thanh toán subscription)** | PayOS, SubscriptionPaymentController, SubscriptionPaymentService, SubscriptionRepository, BillRepository, RestaurantRepository | `handlePaymentWebhook` |
| 25 | **Lấy menu (waiter)** | Waiter, WaiterMenuController, WaiterMenuService, BranchMenuItemRepository, MenuItemRepository, CategoryRepository | `WaiterMenuController` |

Có thể bổ sung sequence diagram cho các luồng này, rồi chuyển sang communication (object + số thứ tự message).

---

## 3. Chức năng chưa phát triển (chỉ có entity / enum)

| # | Use case | Objects gợi ý | Ghi chú |
|---|----------|----------------|--------|
| 26 | **Đặt bàn (Reservation)** | Customer, ReservationController, ReservationService, ReservationRepository, BranchRepository, AreaTableRepository | Entity + ReservationStatus có; chưa có service/controller |
| 27 | **Duyệt / xác nhận / hủy reservation** | Staff, ReservationController, ReservationService, ReservationRepository | Trạng thái: PENDING → CONFIRMED / CANCELLED |
| 28 | **Luồng bếp (Order Line)** | Waiter/Bếp, KitchenController (chưa có), OrderService (mở rộng), OrderLineRepository | OrderLineStatus: PENDING → PREPARING → COMPLETED / CANCELLED; hiện code chỉ set PENDING |

Có thể vẽ communication diagram **theo thiết kế** (object và message mong muốn) để làm đặc tả khi triển khai.

---

## 4. Cách vẽ Communication Diagram từ Sequence

1. Liệt kê **object** (actor, controller, service, repository, …) tương ứng từ sequence.
2. Vẽ **link** giữa hai object có gửi message cho nhau.
3. Trên mỗi link, ghi **message** kèm **số thứ tự** (1, 2, 2.1, 3…) theo đúng thứ tự gọi trong sequence.
4. (Tùy chọn) Ghi **điều kiện** [alt/opt] ngắn gọn bên cạnh message.

Ví dụ (Confirm payment), số thứ tự rút gọn:
- 1: Receptionist → Controller (POST confirm)
- 2: Controller → BillService (confirmPayment)
- 3: BillService → OrderRepository (findById)
- 4: BillService → BranchRepository (findById)
- 5: BillService → OrderRepository (save COMPLETED)
- 6: BillService → AreaTableRepository (save FREE)
- 7: BillService → BillRepository (save Bill)
- 8: return BillDTO → Controller → Receptionist

---

## 5. Component-level communication (PlantUML)

Trong folder này có các file `*-communication-component.puml` thể hiện **giao tiếp giữa các component** (Controller → Service → Repository) cho từng nhóm chức năng, vẽ bằng **component diagram** PlantUML (dễ render, dùng chung cho tài liệu kiến trúc).

| File | Nội dung |
|------|----------|
| `auth-flow-communication-component.puml` | Auth: login, register, logout, forgot password |
| `order-flow-communication-component.puml` | Order: create, add items, cancel |
| `payment-flow-communication-component.puml` | Confirm payment (bill) |
| `subscription-flow-communication-component.puml` | Subscription: create, renew, upgrade; PayOS webhook |
| `restaurant-setup-communication-component.puml` | Restaurant / Branch / Area / Table (owner thiết lập) |
| `staff-management-communication-component.puml` | Staff: create, update, toggle status, assign branch manager |
| `menu-management-communication-component.puml` | Category, Menu item, Customization, Branch menu item |
