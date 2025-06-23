import { User } from './database';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Exemplo: busca usuário autenticado do backend
    const response = await axios.get(API_ENDPOINTS.AUTH.ME, { withCredentials: true });
    return response.data as User;
  } catch (error) {
    return null;
  }
}
