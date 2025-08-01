import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function BarberClients() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new clients management screen
    router.replace('/(barbertabs)/clients-management');
  }, []);

  return null;
}
