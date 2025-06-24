import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkUserSession, initDatabase, getCurrentUser } from '@/services/database';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // Initialize the database
      await initDatabase();
      
      // Check if user is logged in
      const isLoggedIn = await checkUserSession();

      if (isLoggedIn) {
        // Get user data to determine user type
        const userData = await getCurrentUser();
        const userType = userData?.userType || 'client';        if (userType === 'barber') {
          router.replace('/(barbertabs)' as any);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/landing');
      }
    };

    init();
  }, []);

  return null;
}