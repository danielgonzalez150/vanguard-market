import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteProduct, getProducts } from "../../../services/productService";

export default function SellerPanel() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      // USER
      const userData = await SecureStore.getItemAsync("userData");

      if (!userData) return;

      const parsedUser = JSON.parse(userData);

      setUser(parsedUser);

      console.log("USER:", parsedUser);

      // PRODUCTS
      const response = await getProducts();

      console.log("PRODUCTOS:", response);

      const productsData = response?.data || response || [];

      const myProducts = productsData.filter(
        (p: any) => Number(p.sellerId) === Number(parsedUser.userId),
      );

      console.log("MIS PRODUCTOS:", myProducts);

      setProducts(myProducts);
      setFiltered(myProducts);

      // SALES
      const salesData = await SecureStore.getItemAsync("sales");

      if (salesData) {
        const parsedSales = JSON.parse(salesData);

        const mySales = parsedSales.filter(
          (sale: any) => Number(sale.sellerId) === Number(parsedUser.userId),
        );

        console.log("MIS VENTAS:", mySales);

        setSales(mySales);
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error("❌ Error cargando seller panel:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text.trim()) {
      setFiltered(products);
      return;
    }

    const filteredProducts = products.filter((item) =>
      item.name?.toLowerCase().includes(text.toLowerCase()),
    );

    setFiltered(filteredProducts);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar producto",
      "¿Seguro que deseas eliminar este producto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id);

              const updatedProducts = products.filter((p) => p.id !== id);

              setProducts(updatedProducts);
              setFiltered(updatedProducts);

              Alert.alert("Producto eliminado");
            } catch (error) {
              console.error(error);

              Alert.alert("Error", "No se pudo eliminar");
            }
          },
        },
      ],
    );
  };
  const handleResetSales = async () => {
    Alert.alert(
      "Reiniciar ventas",
      "¿Seguro que deseas borrar el historial de ventas?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("sales");

              setSales([]);

              Alert.alert("Ventas reiniciadas");
            } catch (error) {
              console.error(error);

              Alert.alert("Error", "No se pudieron reiniciar");
            }
          },
        },
      ],
    );
  };

  // TOTAL INVENTARIO
  const totalInventory = useMemo(() => {
    return products.reduce((acc, item) => {
      return acc + item.price * item.stock;
    }, 0);
  }, [products]);

  // TOTAL VENTAS
  const totalSales = useMemo(() => {
    return sales.reduce((acc, item) => {
      return acc + item.total;
    }, 0);
  }, [sales]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="bg-white p-5 border-b border-slate-200">
        <Text className="text-3xl font-black text-slate-900">Panel Seller</Text>

        <Text className="text-slate-500 mt-1">Administra tus productos</Text>

        {/* STATS */}
        <View className="flex-row mt-5 gap-2">
          {/* PRODUCTOS */}
          <View className="flex-1 bg-blue-600 p-4 rounded-2xl">
            <Text className="text-white text-xs font-bold">PRODUCTOS</Text>

            <Text className="text-white text-2xl font-black mt-1">
              {products.length}
            </Text>
          </View>

          {/* INVENTARIO */}
          <View className="flex-1 bg-emerald-600 p-4 rounded-2xl">
            <Text className="text-white text-xs font-bold">INVENTARIO</Text>

            <Text className="text-white text-lg font-black mt-1">
              ${totalInventory.toLocaleString()}
            </Text>
          </View>

          {/* VENTAS */}
          <View className="flex-1 bg-purple-600 p-4 rounded-2xl">
            <Text className="text-white text-xs font-bold">VENTAS</Text>

            <Text className="text-white text-lg font-black mt-1">
              ${totalSales.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Buscar producto..."
          value={search}
          onChangeText={handleSearch}
          className="bg-slate-100 p-4 rounded-2xl mt-5"
        />

        {/* CREATE */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/product-form")}
          className="bg-blue-600 p-4 rounded-2xl mt-4"
        >
          <TouchableOpacity
            onPress={handleResetSales}
            className="bg-red-500 p-4 rounded-2xl mt-3"
          >
            <Text className="text-white text-center font-bold">
              Reiniciar Ventas
            </Text>
          </TouchableOpacity>
          <Text className="text-white text-center font-bold">
            + Crear Producto
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-slate-400 text-lg">No tienes productos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-3xl p-4 mb-4 border border-slate-200">
            <View className="flex-row">
              <Image
                source={{
                  uri: item.imageUrl?.startsWith("http")
                    ? item.imageUrl
                    : "https://via.placeholder.com/150",
                }}
                className="w-24 h-24 rounded-2xl bg-slate-100"
              />

              <View className="flex-1 ml-4 justify-center">
                <Text className="text-lg font-bold text-slate-900">
                  {item.name}
                </Text>

                <Text className="text-slate-500 mt-1">{item.brand}</Text>

                <Text className="text-blue-600 font-black text-lg mt-2">
                  ${item.price?.toLocaleString()}
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Stock: {item.stock}
                </Text>
              </View>
            </View>

            {/* BUTTONS */}
            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(main)/product-form",
                    params: {
                      id: item.id,
                    },
                  })
                }
                className="flex-1 bg-yellow-400 p-3 rounded-2xl mr-2"
              >
                <Text className="text-center font-bold">Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="flex-1 bg-red-500 p-3 rounded-2xl ml-2"
              >
                <Text className="text-center text-white font-bold">
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
