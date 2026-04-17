import * as SecureStore from 'expo-secure-store';
import { encryptPassword } from '../utils/encryption';
import api from './api';

export const login = async (email: string, passwordPlano: string) => {
  try {
    // 1. Encriptamos la clave usando tu utilidad
    const passwordCifrada = encryptPassword(passwordPlano);
    
    // 2. Enviamos el objeto con las llaves exactas que pide tu API
    const response = await api.post('/auth/login', { 
      email: email, 
      encryptedPassword: passwordCifrada // Nombre exacto de la llave
    });

    // 3. Si la respuesta es exitosa (200/201), guardamos el token
    if (response.data.token) {
      await SecureStore.setItemAsync('userToken', response.data.token);
      // Opcional: Guardar datos del usuario si la API los envía (nombre, rol, etc.)
      if (response.data.user) {
        // Guardamos el objeto completo como ya hacías
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
        
        // AGREGA ESTA LÍNEA: Guarda el rol solito para consultas rápidas
        await SecureStore.setItemAsync('userRole', response.data.user.role); 
      }
    }
    return response.data;
  } catch (error) {
    // Lanzamos el error para que la pantalla de Login lo capture y lo muestre al usuario
    throw error;
  }
};

export const register = async (
  email: string, 
  passwordPlano: string, 
  firstName: string, 
  lastName: string, 
  identificationNumber: string,
  role: string
) => {
  try {
    // 1. Encriptamos la clave antes de mandarla
    const passwordCifrada = encryptPassword(passwordPlano);
    
    // 2. Enviamos el body EXACTO que espera la API de Azure
    const response = await api.post('/auth/register', { 
      email: email, 
      encryptedPassword: passwordCifrada,
      firstName: firstName,
      identificationNumber: identificationNumber,
      lastName: lastName,
      role: role 
    });

    return response.data;
  } catch (error: any) {
    // Si la API responde con error, lo lanzamos para que el componente lo atrape
    throw error;
  }
};

export const updatePersonalInfo = async (
  firstName: string,
  lastName: string,
  phoneNumber: string,
  dateOfBirth: string
) => {
  try {
    // El interceptor de Axios se encarga del Bearer Token automáticamente
    const response = await api.put('/users/me/personal-info', {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};