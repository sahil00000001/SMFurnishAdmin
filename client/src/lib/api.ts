import { queryClient } from "./queryClient";

const API_BASE = "https://sm-furnishing-backend.onrender.com";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}


// Transform external API product to our format
function transformProduct(product: any, categories: any[] = []) {
  const category = categories.find(cat => cat.id === product.categoryId);
  return {
    id: product._id,
    name: product.name,
    description: product.description || null,
    price: product.price?.toString() || "0",
    categoryId: product.categoryId,
    categoryName: category?.name || "Unknown Category",
    category: category?.name || "Unknown Category", // For backward compatibility
    stock: product.stock || 0,
    status: "active",
    imageUrl: product.imageUrl || null,
    createdAt: product.createdAt ? new Date(product.createdAt) : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : null,
  };
}

export const productsApi = {
  getAll: async () => {
    const [productsResponse, categoriesResponse] = await Promise.all([
      apiRequest("GET", "/api/products").then(res => res.json()),
      apiRequest("GET", "/api/categories").then(res => res.json())
    ]);
    const categories = categoriesResponse.data?.map(transformCategory) || [];
    return productsResponse.data?.map((product: any) => transformProduct(product, categories)) || [];
  },
  getById: async (id: string) => {
    const [productResponse, categoriesResponse] = await Promise.all([
      apiRequest("GET", `/api/products/${id}`).then(res => res.json()),
      apiRequest("GET", "/api/categories").then(res => res.json())
    ]);
    const categories = categoriesResponse.data?.map(transformCategory) || [];
    return productResponse.data ? transformProduct(productResponse.data, categories) : null;
  },
  create: async (data: any) => {
    const externalData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: data.stock,
      categoryId: data.categoryId
    };
    const [productResponse, categoriesResponse] = await Promise.all([
      apiRequest("POST", "/api/products", externalData).then(res => res.json()),
      apiRequest("GET", "/api/categories").then(res => res.json())
    ]);
    const categories = categoriesResponse.data?.map(transformCategory) || [];
    return productResponse.data ? transformProduct(productResponse.data, categories) : null;
  },
  update: async (id: string, data: any) => {
    const externalData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: data.stock,
      categoryId: data.categoryId
    };
    const response = await apiRequest("PUT", `/api/products/${id}`, externalData);
    return response.json();
  },
  delete: (id: string) => apiRequest("DELETE", `/api/products/${id}`)
    .then(res => res.json()),
};

// Transform external API category to our format
function transformCategory(category: any) {
  return {
    id: category._id,
    name: category.name,
    description: category.description || null,
    productCount: 0, // External API doesn't provide this
    status: "active",
  };
}

export const categoriesApi = {
  getAll: () => apiRequest("GET", "/api/categories")
    .then(res => res.json())
    .then(response => response.data?.map(transformCategory) || []),
  getById: (id: string) => apiRequest("GET", `/api/categories/${id}`)
    .then(res => res.json())
    .then(response => response.data ? transformCategory(response.data) : null),
  create: (data: any) => {
    const externalData = {
      name: data.name,
      description: data.description
    };
    return apiRequest("POST", "/api/categories", externalData)
      .then(res => res.json())
      .then(response => response.data ? transformCategory(response.data) : null);
  },
  delete: (id: string) => apiRequest("DELETE", `/api/categories/${id}`)
    .then(res => res.json()),
};

// Transform external API order to our format
function transformOrder(order: any) {
  return {
    ...order, // Include any additional fields from the API first
    // Then override with normalized fields to ensure consistency
    id: order._id,
    orderId: order.order_id,
    customerName: order.customer?.name || order.user?.username || null,
    customerEmail: order.customer?.email || order.user?.user_email || null,
    customerPhone: order.customer?.phone || null,
    customerAddress: order.customer?.address || null,
    status: order.status || 'pending',
    paymentStatus: order.payment?.status || 'pending',
    totalAmount: order.pricing?.total || 0,
    orderDate: order.order_date ? new Date(order.order_date) : new Date(),
    items: order.items || [],
    notes: order.notes || null,
    deliveryDate: order.delivery_date ? new Date(order.delivery_date) : null,
    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
  };
}

export const ordersApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; payment_status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.payment_status) searchParams.append('payment_status', params.payment_status);
    
    const url = `/api/orders${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await apiRequest("GET", url).then(res => res.json());
    
    return {
      orders: response.orders?.map(transformOrder) || [],
      pagination: response.pagination || {},
      total: response.count || response.total || 0
    };
  },
  getById: async (orderId: string) => {
    try {
      // Try different API endpoint patterns
      let response, orderData;
      
      try {
        // Try pattern 1: /api/orders/{orderId}
        response = await apiRequest("GET", `/api/orders/${orderId}`).then(res => res.json());
        orderData = response.data || response.order || response;
        if (orderData) return transformOrder(orderData);
      } catch (error) {
        console.log(`Pattern 1 failed for order ${orderId}`);
      }
      
      try {
        // Try pattern 2: /api/orders/by-id/{orderId}
        response = await apiRequest("GET", `/api/orders/by-id/${orderId}`).then(res => res.json());
        orderData = response.data || response.order || response;
        if (orderData) return transformOrder(orderData);
      } catch (error) {
        console.log(`Pattern 2 failed for order ${orderId}`);
      }
      
      try {
        // Try pattern 3: /api/order/{orderId} (singular)
        response = await apiRequest("GET", `/api/order/${orderId}`).then(res => res.json());
        orderData = response.data || response.order || response;
        if (orderData) return transformOrder(orderData);
      } catch (error) {
        console.log(`Pattern 3 failed for order ${orderId}`);
      }
      
      // Fallback: Search through all orders to find the specific order
      console.log(`All API patterns failed for order ${orderId}, trying fallback search`);
      try {
        const allOrdersResponse = await ordersApi.getAll({ limit: 1000 }); // Get all orders
        const foundOrder = allOrdersResponse.orders.find((order: any) => order.orderId === orderId);
        if (foundOrder) {
          console.log(`Found order ${orderId} through fallback search`);
          return foundOrder;
        }
      } catch (fallbackError) {
        console.error(`Fallback search also failed for order ${orderId}:`, fallbackError);
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      return null;
    }
  }
};
