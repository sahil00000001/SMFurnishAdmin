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
    // Use the categoryId from the form data
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
    // Use the categoryId from the form data
    const externalData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      stock: data.stock,
      categoryId: data.categoryId
    };
    const [productResponse, categoriesResponse] = await Promise.all([
      apiRequest("PUT", `/api/products/${id}`, externalData).then(res => res.json()),
      apiRequest("GET", "/api/categories").then(res => res.json())
    ]);
    const categories = categoriesResponse.data?.map(transformCategory) || [];
    return productResponse.data ? transformProduct(productResponse.data, categories) : null;
  },
  delete: (id: string) => apiRequest("DELETE", `/api/products/${id}`)
    .then(res => res.json()),
};

export const categoriesApi = {
  getAll: () => apiRequest("GET", "/api/categories")
    .then(res => res.json())
    .then(response => response.data?.map(transformCategory) || []),
};
