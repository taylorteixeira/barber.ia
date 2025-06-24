import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="barber-welcome" />
      <Stack.Screen name="barber-onboarding" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}