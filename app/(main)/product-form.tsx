import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadImageToCloudinary } from '../../services/imageService';
import { createProduct, getProducts, updateProduct } from '../../services/productService';

export default function ProductForm() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  // Variable lógica para saber si estamos editando
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [imageUri, setImageUri] = useState<string | null>(null); 
  
  const [form, setForm] = useState({
    name: '',
    categoryId: '5', 
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
    brand: '',
    model: '',
    weight: '',
    color: ''
  });

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      // Buscamos el producto en la lista que devuelve la API
      const product = response.data.find((p: any) => p.id.toString() === id);
      
      if (product) {
        setForm({
          name: product.name || '',
          categoryId: product.categoryId?.toString() || '5',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          imageUrl: product.imageUrl || '',
          description: product.description || '',
          brand: product.brand || '',
          model: product.model || '',
          weight: product.weight?.toString() || '0',
          color: product.color || ''
        });
        if (product.imageUrl) setImageUri(product.imageUrl);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar la información del producto");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Validación básica
    if (!form.name || !form.price || !form.brand) {
      Alert.alert("Campos faltantes", "Por favor llena al menos Nombre, Marca y Precio.");
      return;
    }

    setLoading(true);
    try {
      // 1. Lógica de imagen (Cloudinary)
      let finalUrl = form.imageUrl;
      // Solo subimos a Cloudinary si la URI es local (file://)
      if (imageUri && imageUri.startsWith('file://')) {
        setUploading(true);
        finalUrl = await uploadImageToCloudinary(imageUri);
        setUploading(false);
      }

      // 2. Construir el JSON exacto para la API
      const dataToSend = {
        name: form.name,
        brand: form.brand,
        model: form.model || "Genérico",
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        weight: parseFloat(form.weight) || 0,
        color: form.color || "N/A",
        description: form.description || "",
        imageUrl: finalUrl,
        categoryId: parseInt(form.categoryId)
      };

      if (isEditing) {
        // Usamos el id que viene de useLocalSearchParams
        await updateProduct(Number(id), dataToSend);
        Alert.alert("¡Éxito!", "Producto actualizado correctamente");
      } else {
        await createProduct(dataToSend);
        Alert.alert("¡Éxito!", "Producto publicado con éxito");
      }

      router.back();
    } catch (error: any) {
      console.error("Error en handleSubmit:", error);
      Alert.alert("Error", error.response?.data?.message || "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-3xl font-black text-slate-900 mb-2">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </Text>
      <Text className="text-slate-500 mb-8">Completa los campos para tu catálogo</Text>

      <View className="space-y-4">
        
        {/* SECCIÓN DE IMAGEN */}
        <View className="mb-6 items-center">
          {imageUri ? (
            <View className="w-full relative">
              <Image source={{ uri: imageUri }} className="w-full h-52 rounded-3xl bg-slate-100" />
              <TouchableOpacity 
                onPress={pickImage} 
                className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-full shadow-lg"
              >
                <Text className="text-white font-bold text-xs">🔄 CAMBIAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={pickImage}
              className="w-full h-52 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 justify-center items-center"
            >
              <Text className="text-slate-400 text-lg">📸 Subir imagen</Text>
            </TouchableOpacity>
          )}
          {uploading && <Text className="text-blue-500 font-bold mt-2 animate-pulse">Subiendo imagen...</Text>}
        </View>

        {/* INPUTS */}
        <TextInput placeholder="Nombre del Producto" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4" value={form.name} onChangeText={(t) => setForm({...form, name: t})} />
        
        <View className="flex-row mb-4">
          <TextInput placeholder="Marca" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 mr-2" value={form.brand} onChangeText={(t) => setForm({...form, brand: t})} />
          <TextInput placeholder="Modelo" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.model} onChangeText={(t) => setForm({...form, model: t})} />
        </View>

        <View className="flex-row mb-4">
          <TextInput placeholder="Precio" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 mr-2" value={form.price} onChangeText={(t) => setForm({...form, price: t})} />
          <TextInput placeholder="Stock" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.stock} onChangeText={(t) => setForm({...form, stock: t})} />
        </View>

        <View className="flex-row mb-4">
          <TextInput placeholder="Peso (kg)" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 mr-2" value={form.weight} onChangeText={(t) => setForm({...form, weight: t})} />
          <TextInput placeholder="Color" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.color} onChangeText={(t) => setForm({...form, color: t})} />
        </View>

        <TextInput 
          placeholder="Descripción del producto..." 
          multiline 
          numberOfLines={4} 
          className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6" 
          value={form.description} 
          onChangeText={(t) => setForm({...form, description: t})} 
          textAlignVertical="top"
        />

        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading || uploading}
          className={`p-5 rounded-2xl shadow-xl ${loading || uploading ? 'bg-blue-300' : 'bg-blue-600 shadow-blue-200'}`}
        >
          {loading || uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              {isEditing ? 'Guardar Cambios' : 'Publicar Producto'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}