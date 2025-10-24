import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const tools = [
  {
    name: 'search_products',
    description: 'Search for products with filters like name, category, price range, stock status',
    parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query for product name' },
        category_id: { type: 'string', description: 'Category ID to filter by' },
        category_name: { type: 'string', description: 'Category name to filter by' },
        price_min: { type: 'number', description: 'Minimum price' },
        price_max: { type: 'number', description: 'Maximum price' },
        in_stock_only: { type: 'boolean', description: 'Only show in-stock products' },
        page: { type: 'number', description: 'Page number for pagination' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get detailed information about a specific product by ID',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'number', description: 'Product ID' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'compare_products',
    description: 'Compare multiple products by their IDs',
    parameters: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' }, description: 'Array of product IDs to compare' },
      },
      required: ['ids'],
    },
  },
  {
    name: 'get_similar',
    description: 'Get similar products based on a product ID (same category)',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'number', description: 'Product ID to find similar items for' },
        limit: { type: 'number', description: 'Maximum number of results' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'list_by_category',
    description: 'List products by category ID or category name',
    parameters: {
      type: 'object',
      properties: {
        category_id: { type: 'string', description: 'Category ID' },
        category_name: { type: 'string', description: 'Category name' },
        page: { type: 'number', description: 'Page number' },
      },
    },
  },
  {
    name: 'list_promotions',
    description: 'List products on sale/promotion',
    parameters: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
      },
    },
  },
  {
    name: 'get_order_status',
    description: 'Get the status of an order by order ID',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'number', description: 'Order ID' },
      },
      required: ['order_id'],
    },
  },
];

const systemPrompt = `Bạn là trợ lý ảo của Green Store - cửa hàng chuyên cung cấp nông sản Việt. Nhiệm vụ:
1. Khi khách hỏi về sản phẩm, giá cả, danh mục - hãy gọi tool tương ứng để lấy dữ liệu thực.
2. KHÔNG bịa số liệu. Nếu thiếu thông tin, hỏi lại khách hàng một câu ngắn gọn.
3. Trả lời tối đa 5 sản phẩm. Nếu sản phẩm đang giảm giá (is_sale=true), hiển thị sale_price.
4. Luôn thân thiện, lịch sự và hữu ích. Nhấn mạnh các sản phẩm nông sản Việt Nam chất lượng cao, an toàn và tươi ngon.`;

export async function callGemini(message: string, conversationHistory: any[] = []) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ functionDeclarations: tools as any }],
  });

  const chat = model.startChat({
    history: conversationHistory,
  });

  const result = await chat.sendMessage(`${systemPrompt}\n\nKhách hàng: ${message}`);
  const response = result.response;

  // Check if there are function calls
  const functionCalls = response.functionCalls();

  if (functionCalls && functionCalls.length > 0) {
    return {
      type: 'function_call',
      functionCalls: functionCalls.map((fc: any) => ({
        name: fc.name,
        args: fc.args,
      })),
    };
  }

  // Regular text response
  return {
    type: 'text',
    text: response.text(),
  };
}
