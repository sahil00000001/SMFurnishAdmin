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
function transformProduct(product: any) {
  return {
    id: product._id,
    name: product.name,
    sku: product._id, // Use _id as SKU since external API doesn't have SKU
    description: product.description || null,
    price: product.price?.toString() || "0",
    category: "Living Room", // Default category since external API uses categoryId
    stock: product.stock || 0,
    status: "active",
    imageUrl: product.imageUrl || null,
    createdAt: product.createdAt ? new Date(product.createdAt) : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : null,
  };
}

export const productsApi = {
  getAll: () => apiRequest("GET", "/api/products")
    .then(res => res.json())
    .then(response => response.data?.map(transformProduct) || []),
  getById: (id: string) => apiRequest("GET", `/api/products/${id}`)
    .then(res => res.json())
    .then(response => response.data ? transformProduct(response.data) : null),
  create: (data: any) => {
    // Transform our format to external API format
    const externalData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: data.stock,
      categoryId: "68ca8bd5880d3aaa80cebea5" // Default category ID from API
    };
    return apiRequest("POST", "/api/products", externalData)
      .then(res => res.json())
      .then(response => response.data ? transformProduct(response.data) : null);
  },
  update: (id: string, data: any) => {
    // Transform our format to external API format
    const externalData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: data.stock,
      categoryId: "68ca8bd5880d3aaa80cebea5" // Default category ID from API
    };
    return apiRequest("PUT", `/api/products/${id}`, externalData)
      .then(res => res.json())
      .then(response => response.data ? transformProduct(response.data) : null);
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
};
