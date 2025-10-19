import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  User,
  Phone,
  Mail,
} from 'lucide-react-native';
import {
  createBooking,
  createClient,
  getCurrentUser,
  isUserLoggedIn,
  getBarbershopById,
  Barbershop,
  refreshBarbershopData,
} from '@/services/database';
import { styles } from './booking-styles';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    duration: 30,
    price: 25,
    description: 'Corte tradicional e moderno',
  },
  {
    id: '2',
    name: 'Barba',
    duration: 20,
    price: 15,
    description: 'Aparar e modelar barba',
  },
  {
    id: '3',
    name: 'Corte + Barba',
    duration: 45,
    price: 35,
    description: 'Serviço completo',
  },
  {
    id: '4',
    name: 'Sobrancelha',
    duration: 15,
    price: 10,
    description: 'Design e aparar',
  },
  {
    id: '5',
    name: 'Lavagem + Corte',
    duration: 40,
    price: 30,
    description: 'Lavagem e corte premium',
  },
];

const generateTimeSlots = (selectedDate: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      slots.push({
        time: timeString,
        available: Math.random() > 0.3,
      });
    }
  }

  return slots;
};

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const barberId = params.id as string;

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [availableServices, setAvailableServices] =
    useState<Service[]>(SERVICES);

  useEffect(() => {
    checkLoginStatus();
    loadBarbershopData();
  }, []);
  const loadBarbershopData = async () => {
    if (barberId) {
      try {
        const barbershopInfo = await refreshBarbershopData(barberId);

        let barbershopData: Barbershop | null = null;
        if (barberId.startsWith('real_')) {
          const realBarbershopId = parseInt(barberId.replace('real_', ''));
          barbershopData = await getBarbershopById(realBarbershopId);
        } else if (!isNaN(Number(barberId))) {
          barbershopData = await getBarbershopById(Number(barberId));
        }

        setBarbershop(barbershopData);

        if (barbershopInfo.services && barbershopInfo.services.length > 0) {
          const mappedServices: Service[] = barbershopInfo.services.map(
            (s) => ({
              id: s.id,
              name: s.name,
              duration: s.duration,
              price: s.price,
              description: s.description || 'Serviço profissional',
            })
          );
          setAvailableServices(mappedServices);
          console.log(
            `✅ Loaded ${mappedServices.length} real-time services for barbershop ${barberId}`
          );
        } else {
          setAvailableServices(SERVICES);
        }
      } catch (error) {
        console.error('Error loading barbershop data:', error);
        setAvailableServices(SERVICES);
      }
    }
  };
  const checkLoginStatus = async () => {
    try {
      const loggedIn = await isUserLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setClientInfo({
          name: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || '',
        });
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('pt-BR', { month: 'short' }),
      });
    }

    return dates;
  };

  const dates = generateDates();

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const canProceed = selectedService && selectedDate && selectedTime;
  const handleBooking = () => {
    if (!canProceed) {
      Alert.alert('Erro', 'Por favor, selecione todos os campos obrigatórios');
      return;
    }

    if (isLoggedIn) {
      confirmBooking();
    } else {
      setShowConfirmModal(true);
    }
  };
  const confirmBooking = async () => {
    if (!isLoggedIn && (!clientInfo.name || !clientInfo.phone)) {
      Alert.alert('Erro', 'Por favor, preencha nome e telefone');
      return;
    }

    try {
      if (!isLoggedIn) {
        await createClient({
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email,
          isTemporary: true,
        });
      }
      const bookingId = Date.now().toString();

      let correctBarbershopId: number | undefined;
      if (barbershop) {
        correctBarbershopId = barbershop.id;
      } else if (barberId?.startsWith('real_')) {
        correctBarbershopId = parseInt(barberId.replace('real_', ''));
      } else if (!isNaN(Number(barberId))) {
        correctBarbershopId = Number(barberId);
      }

      await createBooking({
        id: bookingId,
        barbershopId: correctBarbershopId,
        barberName: barbershop ? barbershop.name : 'Barbeiro Premium',
        barberImage:
          'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
        service: selectedService!.name,
        date: selectedDate,
        time: selectedTime,
        price: selectedService!.price,
        status: 'confirmed',
        address: barbershop ? barbershop.address : 'Rua Example, 123',
        phone: barbershop ? barbershop.phone : clientInfo.phone,
        clientName: isLoggedIn ? currentUser?.name : clientInfo.name,
        clientEmail: isLoggedIn ? currentUser?.email : clientInfo.email,
      });
      setShowConfirmModal(false);

      const userName = isLoggedIn ? currentUser?.name : clientInfo.name;
      Alert.alert(
        'Agendamento Confirmado!',
        `${userName}, seu ${
          selectedService!.name
        } foi agendado para ${selectedDate} às ${selectedTime}`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/bookings'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao criar o agendamento. Tente novamente.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Horário</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {barbershop && (
          <View style={styles.barbershopInfo}>
            <Text style={styles.barbershopName}>{barbershop.name}</Text>
            <Text style={styles.barbershopAddress}>{barbershop.address}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolha o Serviço</Text>
          <View style={styles.servicesGrid}>
            {availableServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService?.id === service.id &&
                    styles.serviceCardSelected,
                ]}
                onPress={() => handleServiceSelect(service)}
              >
                <Text
                  style={[
                    styles.serviceName,
                    selectedService?.id === service.id &&
                      styles.serviceNameSelected,
                  ]}
                >
                  {service.name}
                </Text>
                <Text
                  style={[
                    styles.serviceDescription,
                    selectedService?.id === service.id &&
                      styles.serviceDescriptionSelected,
                  ]}
                >
                  {service.description}
                </Text>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceDetail}>
                    <Clock
                      size={14}
                      color={
                        selectedService?.id === service.id ? '#FFFFFF' : '#666'
                      }
                    />
                    <Text
                      style={[
                        styles.serviceDetailText,
                        selectedService?.id === service.id &&
                          styles.serviceDetailTextSelected,
                      ]}
                    >
                      {service.duration}min
                    </Text>
                  </View>
                  <View style={styles.serviceDetail}>
                    <DollarSign
                      size={14}
                      color={
                        selectedService?.id === service.id ? '#FFFFFF' : '#666'
                      }
                    />
                    <Text
                      style={[
                        styles.servicePrice,
                        selectedService?.id === service.id &&
                          styles.servicePriceSelected,
                      ]}
                    >
                      R$ {service.price}
                    </Text>
                  </View>
                </View>
                {selectedService?.id === service.id && (
                  <CheckCircle
                    size={20}
                    color="#FFFFFF"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolha a Data</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesContainer}
          >
            {dates.map((dateItem) => (
              <TouchableOpacity
                key={dateItem.date}
                style={[
                  styles.dateCard,
                  selectedDate === dateItem.date && styles.dateCardSelected,
                ]}
                onPress={() => handleDateSelect(dateItem.date)}
              >
                <Text
                  style={[
                    styles.dateDay,
                    selectedDate === dateItem.date && styles.dateDaySelected,
                  ]}
                >
                  {dateItem.dayName}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    selectedDate === dateItem.date && styles.dateNumberSelected,
                  ]}
                >
                  {dateItem.dayNumber}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    selectedDate === dateItem.date && styles.dateMonthSelected,
                  ]}
                >
                  {dateItem.monthName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolha o Horário</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.time}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotUnavailable,
                    selectedTime === slot.time && styles.timeSlotSelected,
                  ]}
                  onPress={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.timeSlotTextUnavailable,
                      selectedTime === slot.time && styles.timeSlotTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {canProceed && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Resumo do Agendamento</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Serviço:</Text>
                <Text style={styles.summaryValue}>{selectedService!.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Data:</Text>
                <Text style={styles.summaryValue}>
                  {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Horário:</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duração:</Text>
                <Text style={styles.summaryValue}>
                  {selectedService!.duration} minutos
                </Text>
              </View>
              <View style={[styles.summaryItem, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total:</Text>
                <Text style={styles.summaryTotalValue}>
                  R$ {selectedService!.price}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {canProceed && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <Text style={styles.bookButtonText}>
              {isLoggedIn ? 'Confirmar Agendamento' : 'Finalizar Agendamento'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isLoggedIn
                ? 'Confirmar Agendamento'
                : 'Finalize seu Agendamento'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isLoggedIn
                ? 'Revise os dados do seu agendamento'
                : 'Preencha seus dados para confirmar'}
            </Text>
            {!isLoggedIn && (
              <>
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    value={clientInfo.name}
                    onChangeText={(text) =>
                      setClientInfo({ ...clientInfo, name: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Phone size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Telefone"
                    value={clientInfo.phone}
                    onChangeText={(text) =>
                      setClientInfo({ ...clientInfo, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Mail size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail (opcional)"
                    value={clientInfo.email}
                    onChangeText={(text) =>
                      setClientInfo({ ...clientInfo, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}
            {isLoggedIn && (
              <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoTitle}>Seus dados:</Text>
                <Text style={styles.userInfoText}>👤 {currentUser?.name}</Text>
                <Text style={styles.userInfoText}>📞 {currentUser?.phone}</Text>
                {currentUser?.email && (
                  <Text style={styles.userInfoText}>
                    📧 {currentUser?.email}
                  </Text>
                )}
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmBooking}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
