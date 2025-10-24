# prompt.md — Chatbot widget (bottom-left)

## Mục tiêu
Tích hợp **chatbot tư vấn dùng Gemini 1.5** vào dự án **Next.js (App Router, TypeScript)** hiện có.  
Chatbot hiển thị dưới dạng **widget nổi (floating)** ở **góc trái phía dưới** trên mọi trang (không tạo trang `/chat`).  
Hỗ trợ 6 nhóm câu hỏi: (1) Tìm & lọc sản phẩm, (2) Chi tiết sản phẩm, (3) So sánh & gợi ý thay thế, (4) Theo danh mục, (5) Giá & khuyến mãi, (6) Tra cứu trạng thái đơn hàng.

## Ràng buộc
- **Không refactor** kiến trúc bán hàng sẵn có. Chỉ **thêm** file/route cần thiết.
- LLM **chỉ** gọi **API nội bộ** (tools) → **không sinh SQL**.
- Dự án đã có Postgres (Neon). Đã bật `unaccent`. Query **parameterized**.

## Việc cần làm

### 1) Widget UI
- Tạo component **`<ChatWidget />`** (Client Component) hiển thị trên mọi trang:
  - Nút tròn nhỏ “Chat” (icon) **cố định ở bottom-left**: `position: fixed; bottom: 16px; left: 16px; z-index: 50`.
  - Khi mở: panel (`w-96 max-w-[92vw] h-[70vh]`) bo góc, đổ bóng, **không che footer** (đặt `z-index: 50`).
  - Có thể **kéo** trong phạm vi viewport (draggable **tuỳ chọn**).
  - Responsive: trên mobile panel `w-[92vw] h-[70vh]`.
  - Thành phần:
    - Header: tiêu đề “Trợ lý cửa hàng”, nút đóng.
    - Body: danh sách tin nhắn, auto-scroll.
    - Footer: input, nút gửi, Enter để gửi.
  - Hỗ trợ markdown cơ bản; hiển thị **ProductCard** khi có kết quả.

### 2) Mount global
- Thêm `<ChatWidget />` vào **`app/layout.tsx`** (dưới cùng của `<body>`).
- Dùng **Portal** nếu cần để tránh đè layout hiện có.

### 3) Orchestrator LLM (Gemini)
- File `/lib/llm.ts`: khởi tạo Gemini (`@google/generative-ai`) từ `process.env.GEMINI_API_KEY`.
- Dùng **Function Calling** với các tool sau (JSON schema args rõ ràng):
  - `search_products({ q, category_id?, category_name?, price_min?, price_max?, in_stock_only?, sort?, page? })`
  - `get_product({ product_id })`
  - `compare_products({ ids: number[] })`
  - `get_similar({ product_id, limit? })`
  - `list_by_category({ category_id?, category_name?, page? })`
  - `list_promotions({ page? })`
  - `get_order_status({ order_id })`
- **Prompt rules** (system):
  - Khi cần dữ liệu sản phẩm/đơn → **gọi tool** tương ứng; **không bịa số liệu**.
  - Thiếu thông tin → **hỏi lại 1 câu ngắn**.
  - Trả lời tối đa 5 sản phẩm; hiển thị `price_sale` nếu `is_sale=true`, kèm tồn.

### 4) API routes nội bộ (App Router)
- Tất cả route `export const runtime = "nodejs";` + validate bằng **zod** + **parameterized** query.
- Tạo:
  - `GET /api/products/search?q=&category_id=&category_name=&price_min=&price_max=&in_stock_only=&sort=&page=`
  - `GET /api/products/[id]`
  - `GET /api/products/compare?ids=1,2`
  - `GET /api/products/similar?productId=&limit=5`
  - `GET /api/products/by-category?category_id=&category_name=&page=`
  - `GET /api/products/promotions?page=`
  - `GET /api/orders/[id]/status`
- JSON trả về **tối giản**: `{ id, title|name→title, price, price_sale, is_sale, stock, category_id, image_url? }`.

### 5) Chat route
- `POST /api/chat`:
  - Body: `{ message: string }`
  - Gọi Gemini kèm tools; nếu có **tool call** thì gọi route nội bộ tương ứng, lấy JSON, **submit tool outputs**, nhận **final text**.
  - Trả: `{ reply: string, products?: Product[], meta?: {...} }`
  - Log tối thiểu: `tool`, `args`, `rows_count`.

### 6) UI components
- `/components/ProductCard.tsx`: tên, giá (hiện `price_sale` nếu có), badge “Giảm giá”, tồn, ảnh (nếu có).
- `/components/ProductList.tsx`: lưới 1–2 cột tuỳ viewport.
- `/components/ChatWidget.tsx`: quản lý mở/đóng, lưu lịch sử hội thoại local (state).
- Styling: Tailwind (ưu tiên), tối màu nhạt, bo góc `rounded-2xl`, shadow.

## Acceptance tests (bắt buộc pass trong demo)
1. Nút “Chat” xuất hiện ở **bottom-left** trên mọi trang, mở/đóng mượt, không che footer.
2. Câu: “Có **táo** dưới **120k** còn hàng không?” → tool `search_products(...)`, render 1–5 ProductCard.
3. “Chi tiết **Táo Đỏ Mỹ**?” → `get_product`.
4. “So sánh **Táo Đỏ Mỹ** và **Táo Envy**.” → `compare_products`.
5. “Danh mục **Hoa quả** có gì?” → `list_by_category`.
6. “Sản phẩm **khuyến mãi** dưới **100k**.” → `list_promotions` / `search_products` với `price_max=100000`.
7. “Đơn **#123** đang trạng thái gì?” → `get_order_status`.
8. Nếu không có kết quả: hiển thị thông điệp “Hiện chưa có sản phẩm phù hợp…” và gợi ý tìm khác.

## Ghi chú adapter
- Nếu DB của dự án dùng `name` thay vì `title`, tạo **adapter** trong route để chuẩn hoá về `title` trước khi gửi cho LLM/UI.
