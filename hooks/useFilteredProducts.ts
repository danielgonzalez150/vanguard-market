import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { getProducts, Product } from '../services/productService';

export const useFilteredProducts = (onlyMine: boolean = false) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getProducts();
      const userData = await SecureStore.getItemAsync('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (onlyMine && user) {
        // Lógica de seguridad: Si no es ADMIN, solo ve sus productos
        if (user.role === 'ADMIN') {
          setProducts(allProducts);
        } else {
          // Ajusta 'sellerId' o 'userId' según lo que devuelva tu API
          setProducts(allProducts.filter(p => p.sellerId === user.id));
        }
      } else {
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, refresh: fetchProducts };
};