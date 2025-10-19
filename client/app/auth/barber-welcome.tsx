import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  LogIn,
  UserPlus,
  Scissors,
  Star,
} from 'lucide-react-native';
import { styles } from './barber-welcome-styles';

export default function BarberWelcomeScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/landing');
  };

  const handleLogin = () => {
    router.push('/(auth)/login?userType=barber');
  };

  const handleRegister = () => {
    router.push('/(auth)/barber-onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#064E3B', '#059669', '#10B981', '#34D399']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require('@/assets/images/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Área do Barbeiro</Text>
            <Text style={styles.subtitle}>Central de Comando Profissional</Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Scissors size={16} color="#FFFFFF" />
                <Text style={styles.featureText}>Gestão Completa</Text>
              </View>
              <View style={styles.feature}>
                <Star size={16} color="#FFFFFF" />
                <Text style={styles.featureText}>Análises Premium</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.2)',
                  'rgba(255, 255, 255, 0.1)',
                ]}
                style={styles.buttonGradient}
              >
                <LogIn size={24} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Fazer Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F3F4F6']}
                style={styles.buttonGradient}
              >
                <UserPlus size={24} color="#059669" />
                <Text style={styles.registerButtonText}>Criar Conta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.infoText}>
            Já tem uma conta? Use o login para acessar sua central de gestão.
            {'\n'}Novo por aqui? Crie sua conta e configure sua barbearia.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
