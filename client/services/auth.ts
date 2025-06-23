import { User } from './database';
import axios from 'axios';

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Exemplo: busca usuário autenticado do backend
    const response = await axios.get('http://localhost:5000/auth/me', { withCredentials: true });
    return response.data as User;
  } catch (error) {
    return null;
  }
}
