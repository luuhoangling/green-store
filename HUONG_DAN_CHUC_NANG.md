# HƯỚNG DẪN CHỨC NĂNG HỆ THỐNG GREEN STORE

**Tài khoản Admin mặc định:**
- Email: `admin@greenstore.com`
- Mật khẩu: `123456`
- URL Admin: `/admin`

---

## 👥 ACTOR (Tác nhân)

1. **Khách (Guest)** - Người dùng chưa đăng nhập
2. **Khách hàng (User)** - Người dùng đã đăng ký và đăng nhập
3. **Quản trị viên (Admin)** - Người quản lý hệ thống

---

## 🎯 CHỨC NĂNG CHÍNH

### A. CHỨC NĂNG KHÁCH (GUEST)

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem trang chủ | Xem slider, danh mục, sản phẩm nổi bật | `GET /` |
| 2 | Xem danh sách sản phẩm | Xem, lọc, sắp xếp sản phẩm | `GET /api/products` |
| 3 | Tìm kiếm sản phẩm | Tìm kiếm theo tên, danh mục | `GET /api/products/search` |
| 4 | Xem chi tiết sản phẩm | Xem thông tin chi tiết 1 sản phẩm | `GET /api/products/[slug]` |
| 5 | Xem danh mục | Xem sản phẩm theo danh mục | `GET /api/categories` |
| 6 | Chat với AI | Tương tác với chatbot hỗ trợ | `POST /api/chat` |
| 7 | Đăng ký tài khoản | Tạo tài khoản mới | `POST /api/auth/register` |
| 8 | Đăng nhập | Đăng nhập vào hệ thống | `POST /api/auth/login` |

### B. CHỨC NĂNG KHÁCH HÀNG (USER)

**B1. Quản lý tài khoản**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem thông tin cá nhân | Xem profile của mình | `GET /api/me` |
| 2 | Cập nhật thông tin | Sửa tên, đổi mật khẩu | `PUT /api/me` |
| 3 | Quản lý địa chỉ | Thêm/sửa/xóa địa chỉ giao hàng | `GET/POST/PUT/DELETE /api/me/addresses` |
| 4 | Đăng xuất | Đăng xuất khỏi hệ thống | `POST /api/auth/logout` |

**B2. Giỏ hàng & Đặt hàng**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Thêm vào giỏ hàng | Thêm sản phẩm vào giỏ | `POST /api/cart/items` |
| 2 | Xem giỏ hàng | Xem danh sách sản phẩm trong giỏ | `GET /api/cart` |
| 3 | Cập nhật số lượng | Tăng/giảm số lượng sản phẩm | `PUT /api/cart/items/[id]` |
| 4 | Xóa khỏi giỏ hàng | Xóa sản phẩm khỏi giỏ | `DELETE /api/cart/items/[id]` |
| 5 | Thanh toán | Tạo đơn hàng mới | `POST /api/checkout` |

**B3. Quản lý đơn hàng**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem danh sách đơn hàng | Xem tất cả đơn hàng của mình | `GET /api/orders` |
| 2 | Xem chi tiết đơn hàng | Xem thông tin chi tiết 1 đơn hàng | `GET /api/orders/[id]` |
| 3 | Hủy đơn hàng | Hủy đơn hàng (status = pending) | `POST /api/orders/[id]/cancel` |

### C. CHỨC NĂNG QUẢN TRỊ VIÊN (ADMIN)

**C1. Quản lý sản phẩm**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem danh sách sản phẩm | Xem tất cả sản phẩm | `GET /api/admin/products` |
| 2 | Thêm sản phẩm mới | Tạo sản phẩm mới | `POST /api/admin/products` |
| 3 | Cập nhật sản phẩm | Sửa thông tin sản phẩm | `PUT /api/admin/products` |
| 4 | Xóa sản phẩm | Xóa sản phẩm khỏi hệ thống | `DELETE /api/admin/products` |
| 5 | Quản lý tồn kho | Cập nhật số lượng tồn kho | `PUT /api/admin/products` |

**C2. Quản lý đơn hàng**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem danh sách đơn hàng | Xem tất cả đơn hàng | `GET /api/admin/orders` |
| 2 | Cập nhật trạng thái | Chuyển trạng thái đơn hàng | `POST /api/orders/[id]/confirm` |
| | | Pending → Paid | `POST /api/orders/[id]/confirm` |
| | | Paid → Shipped | `POST /api/orders/[id]/ship` |
| | | Shipped → Delivered | `POST /api/orders/[id]/deliver` |
| 3 | Xem chi tiết đơn hàng | Xem thông tin khách hàng, sản phẩm | `GET /api/admin/orders` |

**C3. Quản lý người dùng**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem danh sách người dùng | Xem tất cả users | `GET /api/admin/users` |
| 2 | Khóa/Mở khóa tài khoản | Vô hiệu hóa tài khoản | `PUT /api/admin/users` |
| 3 | Xem lịch sử mua hàng | Xem đơn hàng của user | `GET /api/admin/users` |

**C4. Quản lý khuyến mãi**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem danh sách khuyến mãi | Xem sản phẩm đang sale | `GET /api/admin/promotions` |
| 2 | Tạo khuyến mãi | Đặt giá sale cho sản phẩm | `POST /api/admin/promotions` |
| 3 | Cập nhật khuyến mãi | Sửa giá sale | `PUT /api/admin/promotions` |
| 4 | Xóa khuyến mãi | Kết thúc chương trình sale | `DELETE /api/admin/promotions` |

**C5. Báo cáo & Thống kê**

| STT | Chức năng | Mô tả | API Endpoint |
|-----|-----------|-------|--------------|
| 1 | Xem báo cáo doanh thu | Thống kê doanh thu theo thời gian | `GET /api/admin/revenue` |
| 2 | Thống kê đơn hàng | Số lượng đơn theo trạng thái | `GET /api/admin/orders` |
| 3 | Thống kê sản phẩm | Sản phẩm bán chạy, tồn kho | `GET /api/admin/all-products` |

---

## 🔄 LUỒNG NGHIỆP VỤ CHÍNH

### 1. LUỒNG ĐĂNG KÝ & ĐĂNG NHẬP

```
Khách → Nhập thông tin đăng ký → POST /api/auth/register → Tạo user mới
     → Nhập email/password → POST /api/auth/login → Nhận JWT token → Đăng nhập thành công
```

### 2. LUỒNG MUA HÀNG (Quan trọng!)

```
User → Xem sản phẩm → Thêm vào giỏ hàng → Xem giỏ hàng → Chọn địa chỉ giao hàng 
    → Thanh toán → Tạo đơn hàng → Xác nhận đơn hàng thành công
```

**Lưu ý:** User PHẢI có địa chỉ giao hàng trước khi đặt hàng!

**Các bước chi tiết:**
1. User đăng nhập (`POST /api/auth/login`)
2. Thêm địa chỉ giao hàng (`POST /api/me/addresses`)
3. Thêm sản phẩm vào giỏ (`POST /api/cart/items`)
4. Xem giỏ hàng (`GET /api/cart`)
5. Chọn địa chỉ và thanh toán (`POST /api/checkout`)
6. Xem đơn hàng (`GET /api/orders`)

### 3. LUỒNG XỬ LÝ ĐỜN HÀNG (Admin)

```
Admin → Xem đơn hàng mới (Pending) → Xác nhận đơn hàng (Paid) → Giao hàng (Shipped) 
      → Hoàn thành (Delivered)
```

**Trạng thái đơn hàng:**
- `pending` → Chờ xác nhận
- `paid` → Đã xác nhận/thanh toán
- `shipped` → Đang giao hàng
- `delivered` → Đã giao thành công
- `cancelled` → Đã hủy

### 4. LUỒNG TÌM KIẾM VỚI AI CHATBOT

```
User → Nhập câu hỏi vào chatbot → POST /api/chat → AI xử lý → Gọi API tìm kiếm
    → Trả về danh sách sản phẩm → Hiển thị kết quả cho user
```

**Các chức năng AI hỗ trợ:**
- Tìm kiếm sản phẩm theo tên, danh mục
- So sánh sản phẩm
- Gợi ý sản phẩm tương tự
- Tư vấn sản phẩm

---

## 📊 CẤU TRÚC DATABASE

### Các bảng chính:

1. **users** - Thông tin người dùng
2. **products** - Sản phẩm
3. **categories** - Danh mục sản phẩm
4. **carts** - Giỏ hàng
5. **cart_items** - Chi tiết giỏ hàng
6. **orders** - Đơn hàng
7. **order_items** - Chi tiết đơn hàng
8. **user_addresses** - Địa chỉ giao hàng

### Mối quan hệ:
- User (1) → (n) Orders
- User (1) → (1) Cart → (n) CartItems
- User (1) → (n) Addresses
- Order (1) → (n) OrderItems
- Product (n) → (1) Category

---

## 🔐 XÁC THỰC (AUTHENTICATION)

**Phương thức:** JWT (JSON Web Token)

**Luồng xác thực:**
1. User đăng nhập → Server tạo JWT token
2. Token lưu trong cookie (httpOnly) và localStorage
3. Mỗi request gửi token qua header: `Authorization: Bearer <token>`
4. Server verify token → Trả về dữ liệu

**Phân quyền:**
- `role: 'user'` - Khách hàng thông thường
- `role: 'admin'` - Quản trị viên

---

## 📱 GIAO DIỆN CHÍNH

### User Interface:
- `/` - Trang chủ
- `/products` - Danh sách sản phẩm
- `/products/[slug]` - Chi tiết sản phẩm
- `/categories/[slug]` - Sản phẩm theo danh mục
- `/cart` - Giỏ hàng
- `/orders` - Đơn hàng của tôi
- `/orders/[id]` - Chi tiết đơn hàng
- `/me` - Tài khoản của tôi
- `/login` - Đăng nhập
- `/register` - Đăng ký

### Admin Interface:
- `/admin` - Dashboard admin
- `/admin/products` - Quản lý sản phẩm
- `/admin/orders` - Quản lý đơn hàng
- `/admin/users` - Quản lý người dùng
- `/admin/promotions` - Quản lý khuyến mãi

---

## 🎨 TÍNH NĂNG ĐẶC BIỆT

### 1. AI Chatbot
- Tích hợp Google Gemini AI
- Hỗ trợ tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên
- Tư vấn và so sánh sản phẩm
- Gợi ý sản phẩm tương tự

### 2. Tìm kiếm tiếng Việt
- Hỗ trợ tìm kiếm có dấu và không dấu
- Xử lý biến thể tiếng Việt
- Tìm kiếm thông minh với nhiều từ khóa

### 3. Quản lý địa chỉ
- Thêm nhiều địa chỉ giao hàng
- Đặt địa chỉ mặc định
- Tích hợp bản đồ (Leaflet)
- Gợi ý địa chỉ (Geocoding)

### 4. Quản lý giỏ hàng
- Lưu giỏ hàng theo user
- Cập nhật số lượng real-time
- Snapshot giá sản phẩm khi thêm vào giỏ

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Đặt hàng:** User PHẢI có địa chỉ giao hàng trước khi thanh toán
2. **Hủy đơn:** Chỉ hủy được đơn hàng ở trạng thái `pending`
4. **Admin:** Chỉ admin mới được truy cập `/admin/*`
5. **Token:** Hết hạn sau 7 ngày, cần đăng nhập lại

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

```bash
# Cài đặt dependencies
npm install

# Chạy development
npm run dev

# Mở trình duyệt
http://localhost:3000
```
