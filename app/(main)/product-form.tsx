import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { uploadImageToCloudinary } from '../../services/imageService';
import { createProduct, getProducts } from '../../services/productService';

export default function ProductForm() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Para el estado de Cloudinary
  const [imageUri, setImageUri] = useState<string | null>(null); // Uri local del celu
  
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
      const all = await getProducts();
      const product = all.find((p: any) => p.id.toString() === id);
      if (product) {
        setForm({
          name: product.name,
          categoryId: product.categoryId.toString(),
          price: product.price.toString(),
          stock: product.stock.toString(),
          imageUrl: product.imageUrl,
          description: product.description,
          brand: product.brand,
          model: product.model,
          weight: product.weight.toString(),
          color: product.color
        });
        // Si ya tiene imagen en la nube, la mostramos en la previsualización
        if (product.imageUrl) setImageUri(product.imageUrl);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar el producto");
    }
  };

  // Función para abrir la galería
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // CAMBIA MediaTypeOptions.Images POR ESTO:
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
  setLoading(true);
  try {
    // 1. Subir imagen a Cloudinary si existe una nueva
    let finalUrl = form.imageUrl;
    if (imageUri && imageUri.startsWith('file://')) {
      finalUrl = await uploadImageToCloudinary(imageUri);
    }

    // 2. FORMATEAR DATOS (Esto es vital para Axios)
    const dataToSend = {
      name: form.name,
      brand: form.brand,
      model: form.model,
      price: parseFloat(form.price), // Debe ser número
      stock: parseInt(form.stock),   // Debe ser número
      weight: parseFloat(form.weight) || 0,
      color: form.color,
      description: form.description,
      imageUrl: finalUrl,
      categoryId: parseInt(form.categoryId) || 5 // El ID de categoría debe ser número
    };

    
  // Antes de llamar a createProduct, pon este log para ver qué vas a enviar:
    console.log("DATOS A ENVIAR:", JSON.stringify(dataToSend, null, 2));
    // 3. Enviar a la API
    await createProduct(dataToSend);
    
    Alert.alert("¡Éxito!", "Producto creado");
    router.back();
  } catch (error: any) {
    // MIRA ESTE LOG EN TU TERMINAL:
    console.log("❌ Error al crear:", error.response?.data || error.message);
    Alert.alert("Error de conexión", "No se pudo guardar en el servidor");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-3xl font-black text-slate-900 mb-2">
        {id ? 'Editar Producto' : 'Nuevo Producto'}
      </Text>
      <Text className="text-slate-500 mb-8">Ingresa los detalles técnicos del artículo</Text>

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
                <Text className="text-white font-bold">🔄 Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={pickImage}
              className="w-full h-52 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 justify-center items-center"
            >
              <Text className="text-slate-400 text-lg">📸 Click para subir imagen</Text>
            </TouchableOpacity>
          )}
          {uploading && <Text className="text-blue-500 font-bold mt-2 italic">Subiendo a la nube...</Text>}
        </View>

        {/* CAMPOS DEL FORMULARIO */}
        <TextInput placeholder="Nombre del Producto" className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4" value={form.name} onChangeText={(t) => setForm({...form, name: t})} />
        
        <View className="flex-row space-x-2 mb-4">
          <TextInput placeholder="Marca" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.brand} onChangeText={(t) => setForm({...form, brand: t})} />
          <TextInput placeholder="Modelo" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.model} onChangeText={(t) => setForm({...form, model: t})} />
        </View>

        <View className="flex-row space-x-2 mb-4">
          <TextInput placeholder="Precio" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.price} onChangeText={(t) => setForm({...form, price: t})} />
          <TextInput placeholder="Stock" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.stock} onChangeText={(t) => setForm({...form, stock: t})} />
        </View>

        <View className="flex-row space-x-2 mb-4">
          <TextInput placeholder="Peso (kg)" keyboardType="numeric" className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200" value={form.weight} onChangeText={(t) => setForm({...form, weight: t})} />
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
              {id ? 'Actualizar Producto' : 'Publicar Producto'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}