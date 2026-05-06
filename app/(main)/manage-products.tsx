import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import SellerProductCard from "@/components/SellerProductCard";

export default function ManageProducts() {
  const { data, isLoading } = useSellerProducts();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6 mt-4">
        <View>
          <Text className="text-3xl font-black text-slate-900">
            Inventario
          </Text>
          <Text className="text-slate-500">
            Gestiona tus productos
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(main)/product-form")}
          className="bg-blue-600 w-12 h-12 rounded-2xl justify-center items-center"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <SellerProductCard
            product={item}
            onEdit={() =>
              router.push({
                pathname: "/(main)/product-form",
                params: { productId: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Text className="text-5xl mb-4">📦</Text>
            <Text className="text-gray-400 text-center">
              No tienes productos aún
            </Text>
          </View>
        }
      />
    </View>
  );
}