import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Scissors,
  Star,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  Cpu,
  Rocket,
  Eye,
  Brain,
  Layers,
} from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { styles } from './landig-styles';

export default function LandingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const handleClientAccess = () => {
    router.push('/(auth)/login?userType=client');
  };
  const handleBarberAccess = () => {
    router.push('/(auth)/barber-welcome');
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={[
          '#0C0C1D',
          '#1A1A2E',
          '#16213E',
          '#0F3460',
          '#1B263B',
          '#2D3748',
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.backgroundElement1,
            { transform: [{ rotate: rotation }] },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundElement2,
            { transform: [{ rotate: rotation }] },
          ]}
        />
        <View style={styles.backgroundGrid} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.logoBackground,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <View style={styles.holographicRing} />
                <View style={styles.holographicRing2} />
                <Animated.View
                  style={[
                    styles.sparkleContainer,
                    { transform: [{ rotate: rotation }] },
                  ]}
                >
                  <Sparkles size={20} color="#00F5FF" style={styles.sparkle1} />
                  <Sparkles size={16} color="#FF1493" style={styles.sparkle2} />
                  <Sparkles size={12} color="#7FFF00" style={styles.sparkle3} />
                </Animated.View>
                <Image
                  source={require('@/assets/images/Logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.logoGlow} />
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.titleContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.appName}>
                <Text style={styles.barberText}>Barber</Text>
                <Text style={styles.iaText}>.IA</Text>
              </Text>
              <View style={styles.neonUnderline} />
            </Animated.View>
            <Text style={styles.tagline}>
              🚀 O futuro da gestão de barbearias chegou
            </Text>

            <Text style={styles.subtitle}>
              Sistema completo de gestão para barbearias com tecnologia
              avançada. Transforme sua barbearia em uma experiência do próximo
              nível.
            </Text>

            <View style={styles.techFeaturesContainer}>
              <View style={styles.techFeature}>
                <View style={styles.techIconContainer}>
                  <Brain size={18} color="#00F5FF" />
                </View>
                <Text style={styles.techFeatureText}>IA</Text>
              </View>
              <View style={styles.techFeature}>
                <View style={styles.techIconContainer}>
                  <Zap size={18} color="#FFD700" />
                </View>
                <Text style={styles.techFeatureText}>Rápido</Text>
              </View>
              <View style={styles.techFeature}>
                <View style={styles.techIconContainer}>
                  <Shield size={18} color="#00FF7F" />
                </View>
                <Text style={styles.techFeatureText}>Seguro</Text>
              </View>
              <View style={styles.techFeature}>
                <View style={styles.techIconContainer}>
                  <Cpu size={18} color="#FF69B4" />
                </View>
                <Text style={styles.techFeatureText}>Cloud</Text>
              </View>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.selectionSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>Escolha sua dimensão</Text>
              <View style={styles.hologramLine} />
            </View>

            <TouchableOpacity
              style={styles.userTypeCard}
              onPress={handleClientAccess}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardBorder} />
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <View style={styles.holographicIcon}>
                      <View style={styles.iconGlow} />
                      <User size={32} color="#FFFFFF" />
                      <View style={styles.iconPulse} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>CLIENTE</Text>
                      <Text style={styles.cardSubtitle}>Portal do Futuro</Text>
                      <Text style={styles.cardDescription}>
                        Acesse o universo das melhores barbearias com tecnologia
                        de ponta
                      </Text>
                      <View style={styles.cardTechSpecs}>
                        <View style={styles.techSpec}>
                          <Rocket size={12} color="#60A5FA" />
                          <Text style={styles.techSpecText}>
                            Agendamento Instantâneo
                          </Text>
                        </View>
                        <View style={styles.techSpec}>
                          <Eye size={12} color="#60A5FA" />
                          <Text style={styles.techSpecText}>
                            Experiência Imersiva
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardArrow}>
                    <ArrowRight size={28} color="rgba(255, 255, 255, 0.9)" />
                    <View style={styles.arrowGlow} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userTypeCard}
              onPress={handleBarberAccess}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#064E3B', '#059669', '#10B981']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardBorder} />
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <View style={styles.holographicIcon}>
                      <View style={styles.iconGlow} />
                      <Scissors size={32} color="#FFFFFF" />
                      <View style={styles.iconPulse} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>BARBEIRO</Text>
                      <Text style={styles.cardSubtitle}>
                        Central de Comando
                      </Text>
                      <Text style={styles.cardDescription}>
                        Dashboard completo com agenda, relatórios e gestão
                        inteligente
                      </Text>
                      <View style={styles.cardTechSpecs}>
                        <View style={styles.techSpec}>
                          <TrendingUp size={12} color="#10B981" />
                          <Text style={styles.techSpecText}>
                            Analytics Avançado
                          </Text>
                        </View>
                        <View style={styles.techSpec}>
                          <Layers size={12} color="#10B981" />
                          <Text style={styles.techSpecText}>Gestão Total</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardArrow}>
                    <ArrowRight size={28} color="rgba(255, 255, 255, 0.9)" />
                    <View style={styles.arrowGlow} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.premiumSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.premiumHeader}>
              <Text style={styles.premiumTitle}>Tecnologia do Amanhã</Text>
              <View style={styles.premiumLine} />
              <Text style={styles.premiumSubtitle}>Disponível Hoje</Text>
            </View>

            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Star size={24} color="#FFD700" />
                  <View style={styles.benefitIconGlow} />
                </View>
                <Text style={styles.benefitTitle}>Elite Rating</Text>
                <Text style={styles.benefitDescription}>
                  Avaliado 5⭐ pelos melhores profissionais do setor
                </Text>
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <BarChart3 size={24} color="#00F5FF" />
                  <View style={styles.benefitIconGlow} />
                </View>
                <Text style={styles.benefitTitle}>Analytics Completo</Text>
                <Text style={styles.benefitDescription}>
                  Relatórios detalhados e exportação em CSV/Excel/PDF
                </Text>
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Calendar size={24} color="#FF1493" />
                  <View style={styles.benefitIconGlow} />
                </View>
                <Text style={styles.benefitTitle}>Agenda Inteligente</Text>
                <Text style={styles.benefitDescription}>
                  Visualização semanal e gerenciamento de horários
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Eye size={24} color="#7FFF00" />
                  <View style={styles.benefitIconGlow} />
                </View>
                <Text style={styles.benefitTitle}>IA Visagista</Text>
                <Text style={styles.benefitDescription}>
                  Análise facial inteligente para sugestões de corte
                </Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🌟 Inicie sua jornada no futuro
            </Text>
            <Text style={styles.footerSubtext}>
              Gratuito • Sem limites • Revolucionário
            </Text>
            <View style={styles.footerDecoration} />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
