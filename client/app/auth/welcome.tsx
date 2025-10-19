import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  Check,
  ArrowRight,
  Scissors,
  Users,
  Calendar,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './barber-welcome-styles';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.replace('/(auth)/login?userType=barber');
  };

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Inteligente',
      description: 'Gerencie seus agendamentos de forma fácil e eficiente',
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastre e mantenha o histórico de todos os seus clientes',
    },
    {
      icon: Star,
      title: 'Relatórios Detalhados',
      description:
        'Acompanhe o crescimento do seu negócio com relatórios completos',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Check size={32} color="#FFFFFF" />
            </View>
            <Scissors size={24} color="#FFFFFF" style={styles.scissorsIcon} />
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.title}>Parabéns! 🎉</Text>
            <Text style={styles.subtitle}>
              Sua barbearia foi configurada com sucesso
            </Text>
            <Text style={styles.description}>
              Agora você tem acesso a todas as ferramentas necessárias para
              gerenciar seu negócio de forma profissional.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>
              O que você pode fazer agora:
            </Text>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureItem,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 20 * (index + 1)],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.featureIcon}>
                  <feature.icon size={20} color="#3B82F6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Começar a Usar</Text>
            <ArrowRight size={20} color="#1E40AF" style={styles.buttonIcon} />
          </TouchableOpacity>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Dica:</Text>
            <Text style={styles.tipsText}>
              Complete seu perfil na seção "Configurações" para oferecer uma
              experiência ainda melhor aos seus clientes.
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
