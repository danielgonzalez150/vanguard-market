import { useRouter } from 'expo-router'; // 1. Importar el router
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';

export default function ManageProductsScreen() {
  const router = useRouter(); // 2. Inicializar el router
  
  // 'true' filtra los productos para que solo el dueño (o admin) los vea
  const { products, loading, refresh } = useFilteredProducts(true);

  if (loading) return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header de la pantalla con botón de agregar */}
      <View className="flex-row justify-between items-center mb-6 mt-4">
        <View>
          <Text className="text-3xl font-black text-slate-900">Inventario</Text>
          <Text className="text-slate-500">Gestiona tus publicaciones</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push('/(main)/product-form' as any)} // 3. Ruta al formulario
          className="bg-blue-600 w-12 h-12 rounded-2xl justify-center items-center shadow-md shadow-blue-400"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={refresh}
        refreshing={loading}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            isEditable={true} 
          />
        )}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Text className="text-slate-300 text-5xl mb-4 text-center">📦</Text>
            <Text className="text-center text-slate-400 font-medium">
              No tienes productos publicados aún.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(main)/product-form' as any)}
              className="mt-4"
            >
              <Text className="text-blue-600 font-bold">Publicar mi primer artículo</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}