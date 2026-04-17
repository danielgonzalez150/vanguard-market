import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react'; // Eliminamos useEffect, añadimos useCallback
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getProducts } from '../../services/productService';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Función principal para cargar datos
  const loadData = async () => {
    try {
      // Si no estamos "refrescando" manualmente, mostramos el loader central
      if (!refreshing) setLoading(true);
      
      // 1. Cargar datos del usuario
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) setUser(JSON.parse(userData));

      // 2. Cargar productos desde la API
      const response = await getProducts();
      if (response && response.data) {
        // Invertimos para ver lo más nuevo arriba
        setProducts(response.data.reverse()); 
      }
    } catch (error) {
      console.error("❌ Error en Home:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * EL TRUCO MÁGICO:
   * useFocusEffect se dispara cada vez que la pantalla entra en foco.
   * Al estar envuelto en useCallback, evita ejecuciones infinitas.
   */
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
      {/* HEADER Y ACCIONES */}
      <View className="p-4 pt-6 bg-white shadow-sm border-b border-slate-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-slate-900">Vanguard</Text>
            <Text className="text-blue-600 text-xs font-bold tracking-widest uppercase">
              Panel {user?.role || 'Usuario'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="bg-red-50 px-3 py-1 rounded-lg">
            <Text className="text-red-500 font-bold text-xs">SALIR</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row space-x-3 mb-2">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/profile')} 
            className="flex-1 bg-slate-900 p-3 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-xs italic">MODIFICAR PERFIL</Text>
          </TouchableOpacity>
          
          {user?.role === 'ADMIN' && (
            <TouchableOpacity 
              onPress={() => router.push('/(main)/product-form')} 
              className="flex-1 bg-blue-600 p-3 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-xs">NUEVO PRODUCTO</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={products}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}  />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100 flex-row items-center">
            <Image 
              source={{ 
                uri: item.imageUrl && item.imageUrl.startsWith('http') 
                  ? item.imageUrl 
                  : 'https://via.placeholder.com/150' 
              }} 
              className="w-16 h-16 rounded-2xl bg-slate-200"
              resizeMode="cover"
            />
            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-blue-600 font-black">${item.price.toLocaleString()}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-slate-400 mt-10">No hay productos.</Text>
        }
      />

      {/* BOTÓN FLOTANTE */}
      {user?.role === 'ADMIN' && (
        <TouchableOpacity 
          onPress={() => router.push('/(main)/product-form')}
          className="absolute bottom-8 right-8 bg-blue-600 w-14 h-14 rounded-full shadow-xl items-center justify-center border-4 border-white"
        >
          <Text className="text-white text-3xl font-bold">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}