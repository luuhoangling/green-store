import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/llm';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Call Gemini LLM
    const llmResponse = await callGemini(message);

    // Handle function calls
    if (llmResponse.type === 'function_call' && llmResponse.functionCalls && llmResponse.functionCalls.length > 0) {
      const functionCall = llmResponse.functionCalls[0];
      const { name, args } = functionCall;

      console.log(`[Chat] Tool: ${name}, Args:`, args);

      let products = [];
      let reply = '';

      try {
        // Route to appropriate internal API
        switch (name) {
          case 'search_products': {
            const params = new URLSearchParams();
            if (args.q) params.set('q', args.q);
            if (args.category_id) params.set('category_id', args.category_id);
            if (args.category_name) params.set('category_name', args.category_name);
            if (args.price_min != null) params.set('price_min', String(args.price_min));
            if (args.price_max != null) params.set('price_max', String(args.price_max));
            if (args.in_stock_only) params.set('in_stock_only', 'true');
            if (args.page) params.set('page', String(args.page));

            const searchRes = await fetch(`${getBaseUrl()}/api/products/search?${params.toString()}`);
            products = await searchRes.json();
            reply = products.length > 0 
              ? `Tôi tìm thấy ${products.length} sản phẩm phù hợp:` 
              : 'Hiện chưa có sản phẩm phù hợp. Bạn có thể thử tìm với từ khóa khác hoặc mở rộng bộ lọc.';
            break;
          }

          case 'get_product': {
            const productRes = await fetch(`${getBaseUrl()}/api/products/detail?id=${args.product_id}`);
            const product = await productRes.json();
            if (product && product.id) {
              products = [product];
              reply = `Thông tin chi tiết về sản phẩm:`;
            } else {
              reply = 'Không tìm thấy sản phẩm này.';
            }
            break;
          }

          case 'compare_products': {
            const ids = args.ids.join(',');
            const compareRes = await fetch(`${getBaseUrl()}/api/products/compare?ids=${ids}`);
            products = await compareRes.json();
            reply = products.length > 0 
              ? `So sánh ${products.length} sản phẩm:` 
              : 'Không tìm thấy sản phẩm để so sánh.';
            break;
          }

          case 'get_similar': {
            const params = new URLSearchParams({
              productId: String(args.product_id),
              limit: String(args.limit || 5),
            });
            const similarRes = await fetch(`${getBaseUrl()}/api/products/similar?${params.toString()}`);
            products = await similarRes.json();
            reply = products.length > 0 
              ? `Các sản phẩm tương tự:` 
              : 'Không tìm thấy sản phẩm tương tự.';
            break;
          }

          case 'list_by_category': {
            const params = new URLSearchParams();
            if (args.category_id) params.set('category_id', args.category_id);
            if (args.category_name) params.set('category_name', args.category_name);
            if (args.page) params.set('page', String(args.page));

            const categoryRes = await fetch(`${getBaseUrl()}/api/products/by-category?${params.toString()}`);
            products = await categoryRes.json();
            reply = products.length > 0 
              ? `Sản phẩm trong danh mục:` 
              : 'Không tìm thấy sản phẩm trong danh mục này.';
            break;
          }

          case 'list_promotions': {
            const params = new URLSearchParams();
            if (args.page) params.set('page', String(args.page));

            const promoRes = await fetch(`${getBaseUrl()}/api/products/promotions?${params.toString()}`);
            products = await promoRes.json();
            reply = products.length > 0 
              ? `Các sản phẩm đang khuyến mãi:` 
              : 'Hiện chưa có sản phẩm khuyến mãi.';
            break;
          }

          case 'get_order_status': {
            const orderRes = await fetch(`${getBaseUrl()}/api/orders/${args.order_id}/status`);
            const order = await orderRes.json();
            if (order && order.id) {
              reply = `Đơn hàng #${order.id} - Trạng thái: ${order.status || 'N/A'}, Tổng tiền: ${formatVnd(order.total_amount)}`;
            } else {
              reply = 'Không tìm thấy đơn hàng này.';
            }
            break;
          }

          default:
            reply = 'Xin lỗi, tôi chưa hiểu yêu cầu của bạn.';
        }

        // Limit products to max 5
        if (products.length > 5) {
          products = products.slice(0, 5);
          reply += ` (Hiển thị 5 sản phẩm đầu tiên)`;
        }

        console.log(`[Chat] Tool: ${name}, Result count: ${products.length}`);

        return NextResponse.json({
          reply,
          products: products.length > 0 ? products : undefined,
          meta: { tool: name, args },
        });
      } catch (error) {
        console.error(`[Chat] Error calling tool ${name}:`, error);
        return NextResponse.json({
          reply: 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.',
          meta: { error: String(error) },
        });
      }
    }

    // Regular text response from LLM
    return NextResponse.json({
      reply: llmResponse.text || 'Xin chào! Tôi có thể giúp gì cho bạn?',
    });
  } catch (error) {
    console.error('[Chat] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', reply: 'Xin lỗi, có lỗi xảy ra.' },
      { status: 500 }
    );
  }
}

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

function formatVnd(value?: number | null) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}
