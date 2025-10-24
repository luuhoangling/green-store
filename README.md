# Green Store - Hệ thống Thương mại Điện tử Nông Sản

## Giới thiệu

Green Store là một nền tảng thương mại điện tử chuyên cung cấp nông sản sạch, thực phẩm tươi ngon, được xây dựng với Next.js 14, React, TypeScript và PostgreSQL. Hệ thống cung cấp đầy đủ các tính năng mua sắm trực tuyến, quản lý đơn hàng, và tích hợp chatbot AI hỗ trợ khách hàng.

### Công nghệ sử dụng
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **AI**: Google Generative AI (Gemini)

---

## Tài khoản Admin

Để truy cập trang quản trị, sử dụng thông tin sau:

- **Email**: `admin@greenstore.com`
- **Mật khẩu**: `123456`

**URL Admin**: `/admin`

---

## Các Lưu Ý Quan Trọng

### Luồng Đặt Hàng

1. **Đăng ký/Đăng nhập**: Khách hàng cần đăng ký tài khoản và đăng nhập
2. **Thêm địa chỉ giao hàng**: 
   - Truy cập trang "Tài khoản của tôi" (`/me`)
   - Thêm địa chỉ giao hàng (bắt buộc phải có địa chỉ trước khi đặt hàng)
   - Có thể thêm nhiều địa chỉ và đặt địa chỉ mặc định
3. **Chọn sản phẩm**: Duyệt danh mục và thêm sản phẩm vào giỏ hàng
4. **Xem giỏ hàng**: Truy cập `/cart` để xem và chỉnh sửa giỏ hàng
5. **Thanh toán**: Chọn địa chỉ giao hàng và phương thức thanh toán
6. **Xác nhận đơn hàng**: Hoàn tất đặt hàng và theo dõi trạng thái

### 👤 Chức Năng Người Dùng (User)

- Đăng ký và đăng nhập tài khoản
- Xem danh sách sản phẩm theo danh mục
- Tìm kiếm sản phẩm với gợi ý thông minh
- Xem chi tiết sản phẩm, so sánh sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Quản lý giỏ hàng (thêm, sửa, xóa)
- Quản lý địa chỉ giao hàng
- Đặt hàng và thanh toán
- Xem lịch sử đơn hàng
- Hủy đơn hàng (nếu chưa xử lý)
- Chat với AI hỗ trợ khách hàng

### Chức Năng Quản Trị Viên (Admin)

- **Quản lý sản phẩm**:
  - Thêm, sửa, xóa sản phẩm
  - Upload hình ảnh sản phẩm
  - Quản lý giá, tồn kho, danh mục
  
- **Quản lý đơn hàng**:
  - Xem danh sách tất cả đơn hàng
  - Cập nhật trạng thái đơn hàng (Pending → Processing → Shipped → Delivered)
  - Xem chi tiết đơn hàng và thông tin khách hàng
  
- **Quản lý người dùng**:
  - Xem danh sách người dùng
  - Khóa/mở khóa tài khoản
  - Xem lịch sử mua hàng của người dùng
  
- **Quản lý khuyến mãi**:
  - Tạo và quản lý chương trình khuyến mãi
  - Áp dụng giảm giá theo phần trăm hoặc số tiền
  
- **Báo cáo doanh thu**:
  - Xem thống kê doanh thu theo thời gian
  - Phân tích xu hướng bán hàng

---

## Cài Đặt và Chạy Dự Án

### 2. Cài đặt thư viện

```bash
npm install
```

### 3. Chạy ứng dụng ở chế độ development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

**Phát triển bởi luuhoanglinh** 
