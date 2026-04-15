import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { encryptPassword } from '../../utils/encryption'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validación de campos
    if (!email || !password) {
      Alert.alert("Campos vacíos", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const securePassword = encryptPassword(password);
      
      console.log("Intentando login en Azure...");

      const response = await axios.post('https://ecommerce-api.wittysky-ae597b7e.westus2.azurecontainerapps.io/api/login', {
        email: email,
        password: securePassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("¡Éxito!", "Inicio de sesión correcto.");
        router.replace('/two'); // Navega a la pestaña 'Two'
      }

    } catch (error: any) {
      console.error("Detalle del error:", error.response?.data || error.message);
      
      let mensajeError = "No se pudo conectar con el servidor.";
      
      if (error.response?.status === 401) mensajeError = "Correo o contraseña incorrectos.";
      if (error.response?.status === 404) mensajeError = "Error de configuración: Ruta de API no encontrada.";

      Alert.alert("Error de Login", mensajeError);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>VANGUARD MARKET</Text>
        <Text style={styles.subtitle}>Inicio de Sesión</Text>

        <TextInput 
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput 
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0000FF',
    borderRadius: 10,
    padding: 18,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});