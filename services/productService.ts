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

export const updateProduct = async (id: number, data: Partial<Product>) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};