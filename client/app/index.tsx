import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkUserSession, initDatabase } from '@/services/database';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // Initialize the database
      await initDatabase();
      
      // Check if user is logged in
      const isLoggedIn = await checkUserSession();

      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    };

    init();
  }, []);

  return null;
}