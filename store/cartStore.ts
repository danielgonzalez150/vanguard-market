import { create } from 'zustand';
import { Alert } from 'react-native';

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock?: number;
}

interface CartStore {
  cart: CartItem[];

  addToCart: (product: CartItem) => void;

  removeFromCart: (id: number) => void;

  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const existing = get().cart.find((p) => p.id === product.id);

    // STOCK DISPONIBLE
    const stockAvailable = product.stock || 0;

    // SI YA EXISTE
    if (existing) {

      // VALIDAR STOCK
      if (existing.quantity >= stockAvailable) {
        Alert.alert(
          "Sin stock",
          `Solo hay ${stockAvailable} unidades disponibles`
        );

        return;
      }

      set({
        cart: get().cart.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        ),
      });

    } else {

      // SIN STOCK
      if (stockAvailable <= 0) {
        Alert.alert("Sin stock", "Producto agotado");
        return;
      }

      set({
        cart: [...get().cart, { ...product, quantity: 1 }],
      });

    }
  },

  removeFromCart: (id) => {
    set({
      cart: get().cart.filter((p) => p.id !== id),
    });
  },

  clearCart: () => set({ cart: [] }),
}));