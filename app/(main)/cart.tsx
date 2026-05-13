import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { useCartStore } from "../../store/cartStore";

import { getProducts, updateProduct } from "../../services/productService";

export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useCartStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // FINALIZAR COMPRA
  const handleCheckout = async () => {
    try {
      const response = await getProducts();

      const products = Array.isArray(response) ? response : response.data || [];

      for (const item of cart) {
        const realProduct = products.find((p: any) => p.id === item.id);

        if (!realProduct) continue;

        const newStock = realProduct.stock - item.quantity;

        if (newStock < 0) {
          Alert.alert(
            "Stock insuficiente",
            `No hay suficiente stock de ${item.name}`,
          );
          return;
        }

        const updatedProduct = {
          ...realProduct,
          stock: newStock,
        };

        const existingSales = await SecureStore.getItemAsync("sales");

        const sales = existingSales ? JSON.parse(existingSales) : [];

        sales.push({
          productId: item.id,
          sellerId: realProduct.sellerId,
          total: item.price * item.quantity,
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
        });

        await SecureStore.setItemAsync("sales", JSON.stringify(sales));

        await updateProduct(item.id, updatedProduct);
      }

      Alert.alert("Compra realizada");

      clearCart();

      router.back();
    } catch (error) {
      console.error("ERROR CHECKOUT:", error);

      Alert.alert("Error", "No se pudo finalizar compra");
    }
  };

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-3xl font-black mb-5">Carrito</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-slate-400">
            Tu carrito está vacío
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-4 flex-row">
            <Image
              source={{ uri: item.imageUrl }}
              className="w-20 h-20 rounded-xl"
            />

            <View className="ml-3 flex-1 justify-center">
              <Text className="font-bold text-lg">{item.name}</Text>

              <Text className="text-blue-600 font-black">
                ${item.price.toLocaleString()}
              </Text>

              <Text>Cantidad: {item.quantity}</Text>
            </View>

            <TouchableOpacity
              onPress={() => removeFromCart(item.id)}
              className="bg-red-500 px-3 py-2 rounded-xl self-center"
            >
              <Text className="text-white">X</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {cart.length > 0 && (
        <View className="bg-white p-5 rounded-3xl">
          <Text className="text-2xl font-black">Total:</Text>

          <Text className="text-3xl text-blue-600 font-black mt-2">
            ${total.toLocaleString()}
          </Text>

          {/* FINALIZAR */}
          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-emerald-600 p-4 rounded-2xl mt-4"
          >
            <Text className="text-center text-white font-bold">
              Finalizar Compra
            </Text>
          </TouchableOpacity>

          {/* VACIAR */}
          <TouchableOpacity
            onPress={clearCart}
            className="bg-red-500 p-4 rounded-2xl mt-3"
          >
            <Text className="text-center text-white font-bold">
              Vaciar Carrito
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
