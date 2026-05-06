import { View, Text, Image, TouchableOpacity } from "react-native";
import { useDeleteProduct } from "@/hooks/useDeleteProduct";

export default function SellerProductCard({ product, onEdit }) {
  const { mutate } = useDeleteProduct();

  return (
    <View className="bg-white p-4 rounded-2xl mb-4 shadow">
      <Image
        source={{ uri: product.imageUrl }}
        className="w-full h-40 rounded-xl mb-2"
      />

      <Text className="text-lg font-bold">{product.name}</Text>
      <Text className="text-gray-500">${product.price}</Text>

      <View className="flex-row justify-between mt-3">
        <TouchableOpacity
          onPress={() => onEdit(product)}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => mutate(product.id)}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}