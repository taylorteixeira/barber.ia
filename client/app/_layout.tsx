import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import {
  initDatabase,
  initBarbersDatabase,
  initBookingsDatabase,
} from '@/services/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize database
        await initDatabase();
        // Seed barbers and bookings
        await initBarbersDatabase();
        await initBookingsDatabase();

        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('Error initializing app:', e);
      }
    };

    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(barbertabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="barber/[id]"
          options={{ headerShown: true, title: 'Perfil do Barbeiro' }}
        />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
