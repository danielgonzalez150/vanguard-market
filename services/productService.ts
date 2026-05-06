import api from './api';

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  brand: string;
  model: string;
  weight: number;
  color: string;
  sellerId?: number; // Este es vital para el filtrado
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, productData: any) => {
  // Aquí usamos el ID en la URL como indica tu documentación
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};
export const getProductsBySeller = async (sellerId: string) => {
  const res = await api.get(`/products/seller/${sellerId}`);
  return res.data.data;
};
export const deleteProduct = async (id: number) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};