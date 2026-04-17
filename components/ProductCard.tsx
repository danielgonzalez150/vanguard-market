import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../services/productService';

interface Props {
  product: Product;
  isEditable?: boolean;
}

export default function ProductCard({ product, isEditable = false }: Props) {
  const router = useRouter();

  return (
    <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-100 flex-row items-center">
      {/* Imagen del Producto */}
      <Image 
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }} 
        className="w-24 h-24 rounded-2xl bg-slate-100"
        resizeMode="cover"
      />

      {/* Información */}
      <View className="flex-1 ml-4">
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          {product.brand}
        </Text>
        <Text className="text-slate-900 font-bold text-lg leading-5 mb-1" numberOfLines={2}>
          {product.name}
        </Text>
        <Text className="text-blue-600 font-black text-xl">
          ${product.price.toLocaleString()}
        </Text>
        
        <View className="flex-row items-center mt-2">
          <View className={`px-2 py-0.5 rounded-md ${product.stock > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-[10px] font-bold ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stock > 0 ? `STOCK: ${product.stock}` : 'AGOTADO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de Acción */}
      <View className="ml-2">
        {isEditable ? (
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(main)/product-form', params: { id: product.id } } as any)}
            className="bg-slate-900 p-3 rounded-2xl"
          >
            <Text className="text-white font-bold text-xs text-center">Editar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="bg-blue-600 p-3 rounded-2xl"
            onPress={() => console.log('Añadir al carrito')}
          >
            <Text className="text-white font-bold text-xs">Comprar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}