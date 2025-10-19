import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  checkUserSession,
  initDatabase,
  getCurrentUser,
} from '@/services/database';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await initDatabase();

      const isLoggedIn = await checkUserSession();

      if (isLoggedIn) {
        const userData = await getCurrentUser();
        const userType = userData?.userType || 'client';
        if (userType === 'barber') {
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
