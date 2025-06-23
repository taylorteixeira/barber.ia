import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        router.replace('/landing');
      } catch (error: any) {
        setError(error?.message || String(error));
      }
    };
    init();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Erro na inicialização</Text>
        <Text style={{ color: 'red', fontFamily: 'monospace' }}>{error}</Text>
      </View>
    );
  }

  return null;
}