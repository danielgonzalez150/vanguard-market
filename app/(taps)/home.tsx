import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";

import { useCartStore } from "../../store/cartStore";

import { getProducts } from "../../services/productService";
import Navbar from "@/components/Navbar";

console.log("HOME RENDERIZANDO");

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  sellerId?: number;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // ZUSTAND
  const { addToCart, cart } = useCartStore();

  // CARGAR DATOS
  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);

      const userDataString = await SecureStore.getItemAsync("userData");

      if (userDataString) {
        const parsedUser = JSON.parse(userDataString);
        setUser(parsedUser);
      }

      const response = await getProducts();

      console.log("RESPUESTA PRODUCTS:", response);

      // SI EL BACKEND DEVUELVE ARRAY
if (Array.isArray(response)) {
  const reversed = [...response].reverse();

  setProducts(reversed);
}

// SI EL BACKEND DEVUELVE { data: [] }
else if (response?.data && Array.isArray(response.data)) {
  const reversed = [...response.data].reverse();

  setProducts(reversed);
} else {
  setProducts([]);
}
    } catch (error) {
      console.error("❌ Error en loadData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // REFRESH AUTOMÁTICO
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  // PULL TO REFRESH
  const onRefresh = () => {
    setRefreshing(true);

    loadData();
  };

 

  // LOGOUT
  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Salir",
        style: "destructive",

        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");

          await SecureStore.deleteItemAsync("userData");

          router.replace("/(auth)");
        },
      },
    ]);
  };

  // LOADING
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Navbar />
      <View className="px-4 mt-4">
        <TextInput
          placeholder="Buscar productos..."
          value={search}
          onChangeText={setSearch}
          className="bg-white p-4 rounded-2xl border border-slate-200"
        />
      </View>

      {/* PRODUCTOS */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const myId = user?.userId;

          const canEdit = user?.role === "ADMIN" || myId == item.sellerId;

          return (
            <TouchableOpacity
              onPress={() =>
                canEdit &&
                router.push({
                  pathname: "/(main)/product-form",
                  params: {
                    id: item.id,
                  },
                })
              }
              className="bg-white p-4 rounded-3xl mb-4 flex-row items-center border border-slate-200"
            >
              {/* IMAGEN */}
              <Image
                source={{
                  uri: item.imageUrl?.startsWith("http")
                    ? item.imageUrl
                    : "https://via.placeholder.com/150",
                }}
                className="w-20 h-20 rounded-2xl bg-slate-100"
              />

              {/* INFO */}
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold">{item.name}</Text>

                <Text className="text-slate-500">{item.brand}</Text>

                <Text className="text-blue-600 font-bold mt-1">
                  ${item.price?.toLocaleString()}
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Stock: {item.stock}
                </Text>

                {/* BOTÓN CARRITO */}
                <TouchableOpacity
                  onPress={() => {
                    // SIN STOCK
                    if (item.stock <= 0) {
                      Alert.alert("Sin stock", "Producto agotado");

                      return;
                    }

                    // EXISTE EN CARRITO
                    const existing = cart.find((p) => p.id === item.id);

                    // VALIDAR STOCK
                    if (existing && existing.quantity >= item.stock) {
                      Alert.alert(
                        "Stock límite",
                        "No puedes agregar más unidades",
                      );

                      return;
                    }

                    // AGREGAR
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      stock: item.stock,
                    });

                    Alert.alert("Carrito", "Producto agregado al carrito");
                  }}
                  className="bg-green-600 mt-3 p-2 rounded-xl"
                >
                  <Text className="text-white text-center font-bold">
                    Agregar al carrito
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
