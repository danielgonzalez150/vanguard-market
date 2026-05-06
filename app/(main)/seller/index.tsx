import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getProducts, deleteProduct } from '../../../services/productService';

export default function SellerPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);

      const userData = await SecureStore.getItemAsync('userData');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const response = await getProducts();

      if (response?.data) {
        // 🔥 SOLO PRODUCTOS DEL SELLER
        const myProducts = response.data.filter(
          (p: any) => p.sellerId === parsedUser.userId
        );

        setProducts(myProducts);
      }

    } catch (error) {
      console.error("❌ Error cargando seller panel:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            loadData();
          } catch (err) {
            console.error(err);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">

      {/* HEADER */}
      <Text className="text-2xl font-bold mb-4">
        Mis Productos
      </Text>

      {/* BOTÓN CREAR */}
      <TouchableOpacity
        onPress={() => router.push('/(main)/product-form')}
        className="bg-blue-600 p-4 rounded-xl mb-4"
      >
        <Text className="text-white text-center font-bold">
          + Crear Producto
        </Text>
      </TouchableOpacity>

      {/* LISTA */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-gray-400">
            No tienes productos
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow">

            <Image
              source={{ uri: item.imageUrl }}
              className="w-16 h-16 rounded-xl"
            />

            <View className="ml-3 flex-1">
              <Text className="font-bold">{item.name}</Text>
              <Text className="text-blue-600">
                ${item.price.toLocaleString()}
              </Text>
            </View>

            {/* EDITAR */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(main)/product-form',
                  params: { id: item.id }
                })
              }
              className="bg-yellow-400 px-3 py-2 rounded-lg mr-2"
            >
              <Text>✏️</Text>
            </TouchableOpacity>

            {/* ELIMINAR */}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="bg-red-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white">🗑</Text>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  );
}