import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
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
  Smartphone,
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

const { width, height } = Dimensions.get('window');

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

      {/* Background com gradiente mais sofisticado */}
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
        {/* Elementos de background animados */}
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
          {/* Hero Section Revolucionária */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo com efeito holográfico */}
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

            {/* Título com efeito neon */}
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

            {/* Tech Features com efeito cyberpunk */}
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
          {/* User Selection com design futurista */}
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

            {/* Client Card - Design Cyberpunk */}
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

            {/* Barber Card - Design Premium */}
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
                      </Text>{' '}
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
          {/* Seção de Benefícios Premium */}
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
          {/* Footer futurista */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },

  backgroundElement1: {
    position: 'absolute',
    top: '10%',
    right: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },
  backgroundElement2: {
    position: 'absolute',
    bottom: '20%',
    left: '-15%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 20, 147, 0.3)',
  },
  backgroundGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  heroSection: {
    minHeight: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    position: 'relative',
  },

  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(0, 245, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 20,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  holographicRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 20, 147, 0.6)',
    backgroundColor: 'transparent',
  },
  holographicRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(127, 255, 0, 0.4)',
    backgroundColor: 'transparent',
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 20,
    left: 15,
  },
  sparkle3: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  logo: {
    width: 100,
    height: 100,
    zIndex: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    zIndex: -1,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 48,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 245, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  barberText: {
    color: '#FFFFFF',
  },
  iaText: {
    color: '#00F5FF',
    textShadowColor: 'rgba(0, 245, 255, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  neonUnderline: {
    width: 200,
    height: 3,
    backgroundColor: '#00F5FF',
    marginTop: 8,
    borderRadius: 2,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  tagline: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
    marginBottom: 40,
    maxWidth: width * 0.9,
  },

  techFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  techFeature: {
    alignItems: 'center',
    flex: 1,
  },
  techIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  techFeatureText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  selectionSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  selectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  selectionTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Black',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hologramLine: {
    width: 150,
    height: 2,
    backgroundColor: '#FF1493',
    borderRadius: 1,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },

  userTypeCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    position: 'relative',
  },
  cardGradient: {
    borderRadius: 24,
    padding: 2,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 22,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  holographicIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  iconPulse: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },

  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Black',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardTechSpecs: {
    gap: 6,
  },
  techSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techSpecText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  cardArrow: {
    position: 'relative',
    padding: 8,
  },
  arrowGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: 0,
    left: 0,
  },

  premiumSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  premiumTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumLine: {
    width: 80,
    height: 2,
    backgroundColor: '#FFD700',
    marginVertical: 8,
    borderRadius: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  benefitsGrid: {
    gap: 20,
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    position: 'relative',
  },
  benefitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  benefitIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  benefitTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  benefitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footerSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 16,
    letterSpacing: 1,
    marginBottom: 16,
  },
  footerDecoration: {
    width: 120,
    height: 3,
    backgroundColor: '#00F5FF',
    borderRadius: 2,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
