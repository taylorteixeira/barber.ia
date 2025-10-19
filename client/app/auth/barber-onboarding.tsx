import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Store,
  Check,
} from 'lucide-react-native';
import { styles } from './barber-onboarding-styles';
import { registerAndLoginUser, createBarbershop } from '@/services/database';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: totalSteps }, (_, index) => (
      <View
        key={index}
        style={[
          styles.progressDot,
          index < currentStep
            ? styles.progressDotCompleted
            : styles.progressDotInactive,
          index === currentStep - 1 && styles.progressDotActive,
        ]}
      />
    ))}
  </View>
);

export default function BarberOnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [barbershopData, setBarbershopData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [businessData, setBusinessData] = useState({
    openTime: '08:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
  });

  const [services, setServices] = useState([
    { name: 'Corte Masculino', price: '25', duration: '30', enabled: true },
    { name: 'Barba Completa', price: '20', duration: '25', enabled: true },
    { name: 'Corte + Barba', price: '40', duration: '50', enabled: true },
    { name: 'Sobrancelha', price: '15', duration: '15', enabled: false },
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    if (currentStep === 1) {
      router.push('/landing');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleFinishOnboarding();
      }
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validatePersonalData();
      case 2:
        return validateBarbershopData();
      case 3:
        return validateBusinessData();
      case 4:
        return validateServices();
      default:
        return false;
    }
  };

  const validatePersonalData = () => {
    const { name, email, phone, password, confirmPassword } = personalData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const validateBarbershopData = () => {
    const { name, address, city, state } = barbershopData;

    if (!name || !address || !city || !state) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    return true;
  };

  const validateBusinessData = () => {
    const { openTime, closeTime } = businessData;

    if (openTime >= closeTime) {
      Alert.alert(
        'Erro',
        'O horário de abertura deve ser anterior ao de fechamento'
      );
      return false;
    }

    const hasWorkDay = Object.values(businessData.workDays).some((day) => day);
    if (!hasWorkDay) {
      Alert.alert('Erro', 'Selecione pelo menos um dia de funcionamento');
      return false;
    }

    return true;
  };

  const validateServices = () => {
    const activeServices = services.filter((service) => service.enabled);

    if (activeServices.length === 0) {
      Alert.alert('Erro', 'Ative pelo menos um serviço');
      return false;
    }

    for (const service of activeServices) {
      if (!service.name || !service.price || !service.duration) {
        Alert.alert('Erro', 'Preencha todos os dados dos serviços ativos');
        return false;
      }
    }

    return true;
  };
  const handleFinishOnboarding = async () => {
    setLoading(true);

    try {
      const loggedInUser = await registerAndLoginUser({
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        password: personalData.password,
        userType: 'barber',
      });

      if (!loggedInUser) {
        Alert.alert('Erro', 'Erro ao criar conta do usuário');
        setLoading(false);
        return;
      }
      const barbershopSuccess = await createBarbershop({
        name: barbershopData.name,
        description: barbershopData.description,
        address: barbershopData.address,
        phone: personalData.phone,
        email: personalData.email,
        ownerId: loggedInUser.id!,
        workingHours: {
          monday: {
            isOpen: businessData.workDays.monday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          tuesday: {
            isOpen: businessData.workDays.tuesday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          wednesday: {
            isOpen: businessData.workDays.wednesday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          thursday: {
            isOpen: businessData.workDays.thursday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          friday: {
            isOpen: businessData.workDays.friday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          saturday: {
            isOpen: businessData.workDays.saturday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
          sunday: {
            isOpen: businessData.workDays.sunday,
            openTime: businessData.openTime,
            closeTime: businessData.closeTime,
            breakStart: businessData.breakStart,
            breakEnd: businessData.breakEnd,
          },
        },
        services: services
          .filter((service) => service.enabled)
          .map((service, index) => ({
            id: `service_${index + 1}`,
            name: service.name,
            price: parseFloat(service.price),
            duration: parseInt(service.duration),
            category: 'Corte e Barba',
            isActive: true,
            createdAt: new Date().toISOString(),
          })),
      });
      if (barbershopSuccess) {
        Alert.alert(
          'Bem-vindo!',
          'Conta criada com sucesso! Agora você está logado e pode começar a usar o sistema.',
          [
            {
              text: 'Começar',
              onPress: () => router.replace('/(barbertabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Erro ao criar a barbearia');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro durante o cadastro. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>
      <Text style={styles.stepSubtitle}>Primeiro, vamos conhecer você</Text>

      <View style={styles.inputContainer}>
        <User size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={personalData.name}
          onChangeText={(text) =>
            setPersonalData({ ...personalData, name: text })
          }
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Mail size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={personalData.email}
          onChangeText={(text) =>
            setPersonalData({ ...personalData, email: text })
          }
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={personalData.phone}
          onChangeText={(text) =>
            setPersonalData({ ...personalData, phone: text })
          }
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={personalData.password}
          onChangeText={(text) =>
            setPersonalData({ ...personalData, password: text })
          }
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#6B7280" />
          ) : (
            <Eye size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          value={personalData.confirmPassword}
          onChangeText={(text) =>
            setPersonalData({ ...personalData, confirmPassword: text })
          }
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color="#6B7280" />
          ) : (
            <Eye size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Dados da Barbearia</Text>
      <Text style={styles.stepSubtitle}>
        Agora vamos configurar sua barbearia
      </Text>

      <View style={styles.inputContainer}>
        <Store size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nome da barbearia"
          value={barbershopData.name}
          onChangeText={(text) =>
            setBarbershopData({ ...barbershopData, name: text })
          }
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição (opcional)"
          value={barbershopData.description}
          onChangeText={(text) =>
            setBarbershopData({ ...barbershopData, description: text })
          }
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Endereço completo"
          value={barbershopData.address}
          onChangeText={(text) =>
            setBarbershopData({ ...barbershopData, address: text })
          }
          autoCapitalize="words"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.flex1]}>
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={barbershopData.city}
            onChangeText={(text) =>
              setBarbershopData({ ...barbershopData, city: text })
            }
            autoCapitalize="words"
          />
        </View>
        <View style={[styles.inputContainer, styles.flex1]}>
          <TextInput
            style={styles.input}
            placeholder="Estado"
            value={barbershopData.state}
            onChangeText={(text) =>
              setBarbershopData({ ...barbershopData, state: text })
            }
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="CEP (opcional)"
          value={barbershopData.zipCode}
          onChangeText={(text) =>
            setBarbershopData({ ...barbershopData, zipCode: text })
          }
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Horário de Funcionamento</Text>
      <Text style={styles.stepSubtitle}>
        Configure quando sua barbearia funciona
      </Text>

      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>Horários</Text>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Clock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Abertura"
              value={businessData.openTime}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, openTime: text })
              }
            />
          </View>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Clock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Fechamento"
              value={businessData.closeTime}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, closeTime: text })
              }
            />
          </View>
        </View>

        <Text style={styles.sectionSubtitle}>
          Intervalo para almoço (opcional)
        </Text>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <TextInput
              style={styles.input}
              placeholder="Início (12:00)"
              value={businessData.breakStart}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, breakStart: text })
              }
            />
          </View>
          <View style={[styles.inputContainer, styles.flex1]}>
            <TextInput
              style={styles.input}
              placeholder="Fim (13:00)"
              value={businessData.breakEnd}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, breakEnd: text })
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.workDaysSection}>
        <Text style={styles.sectionTitle}>Dias de Funcionamento</Text>
        {Object.entries(businessData.workDays).map(([day, isActive]) => (
          <TouchableOpacity
            key={day}
            style={styles.dayToggle}
            onPress={() =>
              setBusinessData({
                ...businessData,
                workDays: {
                  ...businessData.workDays,
                  [day]: !isActive,
                },
              })
            }
          >
            <Text style={styles.dayName}>
              {day === 'monday' && 'Segunda-feira'}
              {day === 'tuesday' && 'Terça-feira'}
              {day === 'wednesday' && 'Quarta-feira'}
              {day === 'thursday' && 'Quinta-feira'}
              {day === 'friday' && 'Sexta-feira'}
              {day === 'saturday' && 'Sábado'}
              {day === 'sunday' && 'Domingo'}
            </Text>
            <View style={[styles.toggle, isActive && styles.toggleActive]}>
              {isActive && <Check size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Serviços Básicos</Text>
      <Text style={styles.stepSubtitle}>
        Configure os principais serviços da sua barbearia
      </Text>

      {services.map((service, index) => (
        <View key={index} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <TouchableOpacity
              style={[
                styles.serviceToggle,
                service.enabled && styles.serviceToggleActive,
              ]}
              onPress={() => {
                const newServices = [...services];
                newServices[index].enabled = !newServices[index].enabled;
                setServices(newServices);
              }}
            >
              {service.enabled && <Check size={14} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          {service.enabled && (
            <View style={styles.serviceDetails}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <DollarSign
                    size={16}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Preço"
                    value={service.price}
                    onChangeText={(text) => {
                      const newServices = [...services];
                      newServices[index].price = text;
                      setServices(newServices);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Clock size={16} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Duração (min)"
                    value={service.duration}
                    onChangeText={(text) => {
                      const newServices = [...services];
                      newServices[index].duration = text;
                      setServices(newServices);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Cadastro de Barbeiro</Text>
            <Text style={styles.stepIndicator}>
              Etapa {currentStep} de {totalSteps}
            </Text>
          </View>

          <View style={styles.headerSpace} />
        </View>

        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.content}>{renderCurrentStep()}</View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? 'Finalizar Cadastro' : 'Próximo'}
            </Text>
            {currentStep < totalSteps && (
              <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
