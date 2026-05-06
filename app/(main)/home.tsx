import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getProducts } from '../../services/productService';
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);

      const userDataString = await SecureStore.getItemAsync('userData');

      if (userDataString) {
        const parsedUser = JSON.parse(userDataString);
        setUser(parsedUser);
      }

      const response = await getProducts();
      if (response && response.data) {
        setProducts(response.data.reverse());
      }
    } catch (error) {
      console.error("❌ Error en loadData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
          router.replace('/(auth)');
        }
      }
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">

      {/* HEADER */}
      <View className="p-4 pt-6 bg-white border-b border-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-slate-900">Vanguard</Text>
            <Text className="text-blue-600 text-xs font-bold uppercase">
              Panel {user?.role || 'Usuario'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout} className="bg-red-50 px-3 py-1 rounded-lg">
            <Text className="text-red-500 font-bold text-xs">SALIR</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => router.push('/(main)/profile')}
            className="flex-1 bg-slate-900 p-3 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-xs">
              MODIFICAR PERFIL
            </Text>
          </TouchableOpacity>

          {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
            <TouchableOpacity
              onPress={() => router.push('/(main)/product-form')}
              className="flex-1 bg-blue-600 p-3 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-xs">
                NUEVO PRODUCTO
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BOTÓN PANEL SELLER */}
      {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
        <TouchableOpacity
          onPress={() => {
            console.log("CLICK SELLER");
            router.push('/(main)/seller');
          }}
          className="bg-purple-600 p-4 rounded-xl m-4"
        >
          <Text className="text-white text-center font-bold">
            Panel Vendedor
          </Text>
        </TouchableOpacity>
      )}

      {/* LISTA */}
      <FlatList
        data={products}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const myId = user?.userId;
          const canEdit =
            user?.role === 'ADMIN' || myId == item.sellerId;

          return (
            <TouchableOpacity
              onPress={() =>
                canEdit &&
                router.push({
                  pathname: '/(main)/product-form',
                  params: { id: item.id }
                })
              }
              className="bg-white p-4 rounded-3xl mb-4 flex-row items-center border"
            >
              <Image
                source={{
                  uri: item.imageUrl?.startsWith('http')
                    ? item.imageUrl
                    : 'https://via.placeholder.com/150'
                }}
                className="w-20 h-20 rounded-2xl bg-slate-100"
              />

              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold">
                  {item.name}
                </Text>
                <Text className="text-blue-600 font-bold">
                  ${item.price?.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

    </View>
  );
}