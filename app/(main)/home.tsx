import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
// 1. AÑADIMOS Image AQUÍ
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getProducts } from '../../services/productService';
// 2. ELIMINAMOS la importación errónea de react-native-reanimated

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  sellerId?: number; // 3. AÑADIMOS sellerId para que TypeScript no arroje error
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
      
      // 1. Obtener los datos del usuario de SecureStore
      const userDataString = await SecureStore.getItemAsync('userData');
      
      if (userDataString) {
        const parsedUser = JSON.parse(userDataString);
        console.log("👤 Usuario cargado en estado:", parsedUser); // Verás si tiene .id o .userId
        setUser(parsedUser);
      }

      // 2. Cargar los productos
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
          
          {/* ✅ CORRECTO: Admin o Seller pueden ver el botón */}
          {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          console.log(`Producto: ${item.name} | Mi ID: ${user?.id} | Dueño ID: ${item.sellerId}`);
          const myId = user?.userId;
          const canEdit = user?.role === 'ADMIN' || myId == item.sellerId;
          console.log(`Producto: ${item.name} | Mi ID: ${myId} | Dueño ID: ${item.sellerId} | ¿Puedo editar?: ${canEdit}`);
          return (
            <TouchableOpacity 
              onPress={() => canEdit && router.push({
                pathname: '/(main)/product-form',
                params: { id: item.id } 
              })}
              activeOpacity={canEdit ? 0.7 : 1}
              className={`bg-white p-4 rounded-3xl mb-4 shadow-sm border flex-row items-center ${
                canEdit ? 'border-blue-100' : 'border-slate-100'
              }`}
            >
              <Image 
                source={{ 
                  uri: item.imageUrl && item.imageUrl.startsWith('http') 
                    ? item.imageUrl 
                    : 'https://via.placeholder.com/150' 
                }} 
                className="w-20 h-20 rounded-2xl bg-slate-100"
                resizeMode="cover"
              />

              <View className="ml-4 flex-1 justify-center">
                <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
                  {item.name || "Producto sin nombre"}
                </Text>
                <Text className="text-blue-600 font-black text-base">
                  ${item.price ? item.price.toLocaleString() : '0'}
                </Text>
                
                {canEdit && (
                  <Text className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-tighter">
                    PROPIEDAD DE: {user?.role === 'ADMIN' && item.sellerId !== user.id ? 'OTRO SELLER' : 'TI'}
                  </Text>
                )}
              </View>

              {canEdit && (
                <View className="bg-blue-600 w-10 h-10 rounded-2xl items-center justify-center shadow-sm ml-2">
                   <Text className="text-white text-lg">✎</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-slate-400 mt-10">No hay productos disponibles.</Text>
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