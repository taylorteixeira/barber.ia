import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  DollarSign,
  X,
  Save,
  UserPlus,
  Users,
} from 'lucide-react-native';
import {
  getCurrentUser,
  getBarbershopByOwnerId,
  getBarbersByBarbershopId,
  getUserById,
  getBarberProfileByUserId,
  getEffectiveBarberWorkingHours,
  User as UserType,
  Barbershop,
  WorkingHours,
} from '../../services/database';
import { styles } from './new-appointment-styles';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isTemporary?: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Barber {
  id: string;
  userId: number;
  name: string;
  specialties: string[];
  isActive: boolean;
}

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  barberId?: string;
  barberName?: string;
  price: number;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function NewAppointment() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 99999-1111',
      email: 'joao@email.com',
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '(11) 99999-2222',
      email: 'maria@email.com',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      phone: '(11) 99999-3333',
      email: 'pedro@email.com',
    },
  ]);

  const [services] = useState<Service[]>([
    { id: '1', name: 'Corte Masculino', price: 25, duration: 30 },
    { id: '2', name: 'Barba Completa', price: 20, duration: 25 },
    { id: '3', name: 'Corte + Barba', price: 40, duration: 50 },
    { id: '4', name: 'Sobrancelha', price: 15, duration: 15 },
  ]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbersDetails, setBarbersDetails] = useState<{
    [key: number]: UserType;
  }>({});
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
  });

  const timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.phone.includes(clientSearchQuery.replace(/\D/g, ''))
  );

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    }
    return phone;
  };

  const handleCreateTemporaryClient = () => {
    if (!newClientForm.name || !newClientForm.phone) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }

    const tempClient: Client = {
      id: `temp_${Date.now()}`,
      name: newClientForm.name,
      phone: formatPhone(newClientForm.phone),
      isTemporary: true,
    };

    setClients([...clients, tempClient]);
    setSelectedClient(tempClient);
    setShowNewClientModal(false);
    setNewClientForm({ name: '', phone: '' });
    Alert.alert('Sucesso', 'Cliente temporário criado!');
  };
  const handleSaveAppointment = () => {
    if (
      !selectedClient ||
      !selectedService ||
      !selectedBarber ||
      !appointmentDate ||
      !appointmentTime
    ) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      price: selectedService.price,
      date: appointmentDate,
      time: appointmentTime,
      duration: selectedService.duration,
      status: 'pending',
    };

    console.log('Agendamento criado:', appointment);

    Alert.alert(
      'Agendamento Criado!',
      `Cliente: ${selectedClient.name}\nServiço: ${
        selectedService.name
      }\nBarbeiro: ${
        selectedBarber.name
      }\nData: ${appointmentDate} às ${appointmentTime}\nValor: R$ ${selectedService.price.toFixed(
        2
      )}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const generateAvailableTimeSlots = async () => {
    if (!selectedBarber || !appointmentDate || !barbershop) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      let workingHours: WorkingHours;

      if (selectedBarber.id === 'owner') {
        workingHours = barbershop.workingHours;
      } else {
        const barberProfile = await getBarberProfileByUserId(
          selectedBarber.userId
        );
        if (!barberProfile) {
          setAvailableTimeSlots([]);
          return;
        }
        workingHours = getEffectiveBarberWorkingHours(
          barberProfile,
          barbershop.workingHours
        );
      }

      const date = new Date(appointmentDate);
      const dayNames = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const dayOfWeek = dayNames[date.getDay()] as keyof WorkingHours;
      const daySchedule = workingHours[dayOfWeek];

      if (!daySchedule || !daySchedule.isOpen) {
        setAvailableTimeSlots([]);
        return;
      }

      const slots: string[] = [];
      const openMinutes = timeToMinutes(daySchedule.openTime);
      const closeMinutes = timeToMinutes(daySchedule.closeTime);
      const breakStartMinutes = daySchedule.breakStart
        ? timeToMinutes(daySchedule.breakStart)
        : null;
      const breakEndMinutes = daySchedule.breakEnd
        ? timeToMinutes(daySchedule.breakEnd)
        : null;

      for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
        if (
          breakStartMinutes &&
          breakEndMinutes &&
          minutes >= breakStartMinutes &&
          minutes < breakEndMinutes
        ) {
          continue;
        }

        const timeString = minutesToTime(minutes);
        slots.push(timeString);
      }

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Erro ao gerar horários disponíveis:', error);
      setAvailableTimeSlots([]);
    }
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  };
  useEffect(() => {
    loadBarbers();
  }, []);

  useEffect(() => {
    generateAvailableTimeSlots();
  }, [selectedBarber, appointmentDate, barbershop]);

  useEffect(() => {
    generateAvailableTimeSlots();
  }, [selectedBarber, appointmentDate]);
  const loadBarbers = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const barbershop = await getBarbershopByOwnerId(currentUser.id);
        if (barbershop) {
          setBarbershop(barbershop);
          const shopBarbers = await getBarbersByBarbershopId(barbershop.id);

          const barbersDetailsMap: { [key: number]: UserType } = {};
          const barbersWithDetails: Barber[] = [];

          for (const barber of shopBarbers) {
            if (barber.isActive) {
              const userDetails = await getUserById(barber.userId);
              if (userDetails) {
                barbersDetailsMap[barber.userId] = userDetails;
                barbersWithDetails.push({
                  id: barber.id.toString(),
                  userId: barber.userId,
                  name: userDetails.name,
                  specialties: barber.specialties,
                  isActive: barber.isActive,
                });
              }
            }
          }

          barbersWithDetails.unshift({
            id: 'owner',
            userId: currentUser.id,
            name: currentUser.name,
            specialties: ['Proprietário'],
            isActive: true,
          });
          barbersDetailsMap[currentUser.id] = currentUser;

          setBarbers(barbersWithDetails);
          setBarbersDetails(barbersDetailsMap);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Agendamento</Text>
        <TouchableOpacity
          onPress={handleSaveAppointment}
          style={styles.saveButton}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setShowClientModal(true)}
          >
            {selectedClient ? (
              <View style={styles.selectedItem}>
                <User size={20} color="#059669" />
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName}>
                    {selectedClient.name}
                  </Text>
                  <Text style={styles.selectedItemDetail}>
                    {selectedClient.phone}
                    {selectedClient.isTemporary && ' (Temporário)'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <User size={20} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Selecionar cliente</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviço</Text>
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setShowServiceModal(true)}
          >
            {selectedService ? (
              <View style={styles.selectedItem}>
                <DollarSign size={20} color="#059669" />
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName}>
                    {selectedService.name}
                  </Text>
                  <Text style={styles.selectedItemDetail}>
                    R$ {selectedService.price.toFixed(2)} •
                    {selectedService.duration} min
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <DollarSign size={20} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Selecionar serviço</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barbeiro</Text>
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setShowBarberModal(true)}
          >
            {selectedBarber ? (
              <View style={styles.selectedItem}>
                <Users size={20} color="#059669" />
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName}>
                    {selectedBarber.name}
                  </Text>
                  <Text style={styles.selectedItemDetail}>
                    {selectedBarber.specialties.join(', ')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Users size={20} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Selecionar barbeiro</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TextInput
            style={styles.input}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setAppointmentDate(getTodayDate())}
          >
            <Calendar size={16} color="#059669" />
            <Text style={styles.quickDateText}>Hoje</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário</Text>
          <View style={styles.timeGrid}>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    appointmentTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setAppointmentTime(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      appointmentTime === time && styles.timeSlotTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noTimeSlots}>
                <Text style={styles.noTimeSlotsText}>
                  Sem horários disponíveis
                </Text>
              </View>
            )}
          </View>
        </View>

        {selectedClient &&
          selectedService &&
          selectedBarber &&
          appointmentDate &&
          appointmentTime && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Resumo do Agendamento</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Cliente:</Text>
                <Text style={styles.summaryValue}>{selectedClient.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Serviço:</Text>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Barbeiro:</Text>
                <Text style={styles.summaryValue}>{selectedBarber.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Data e Hora:</Text>
                <Text style={styles.summaryValue}>
                  {appointmentDate} às {appointmentTime}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Valor:</Text>
                <Text style={[styles.summaryValue, styles.summaryPrice]}>
                  R$ {selectedService.price.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
      </ScrollView>

      {selectedClient &&
        selectedService &&
        selectedBarber &&
        appointmentDate &&
        appointmentTime && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleSaveAppointment}
          >
            <Save size={24} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>Confirmar Agendamento</Text>
          </TouchableOpacity>
        )}

      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowClientModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            <TouchableOpacity onPress={() => setShowNewClientModal(true)}>
              <UserPlus size={24} color="#059669" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou telefone..."
              value={clientSearchQuery}
              onChangeText={setClientSearchQuery}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {filteredClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientItem}
                onPress={() => {
                  setSelectedClient(client);
                  setShowClientModal(false);
                  setClientSearchQuery('');
                }}
              >
                <User size={20} color="#6B7280" />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>
                    {client.name}
                    {client.isTemporary && ' (Temporário)'}
                  </Text>
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredClients.length === 0 && clientSearchQuery && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
                <TouchableOpacity
                  style={styles.createClientButton}
                  onPress={() => {
                    setNewClientForm({
                      name: clientSearchQuery,
                      phone: '',
                    });
                    setShowNewClientModal(true);
                  }}
                >
                  <UserPlus size={16} color="#FFFFFF" />
                  <Text style={styles.createClientButtonText}>
                    Criar Cliente
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowServiceModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecionar Serviço</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => {
                  setSelectedService(service);
                  setShowServiceModal(false);
                }}
              >
                <DollarSign size={20} color="#6B7280" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetails}>
                    R$ {service.price.toFixed(2)} • {service.duration} min
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showBarberModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBarberModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecionar Barbeiro</Text>
            <View style={styles.headerSpace} />
          </View>

          <ScrollView style={styles.modalContent}>
            {barbers.map((barber) => (
              <TouchableOpacity
                key={barber.id}
                style={[
                  styles.optionButton,
                  selectedBarber?.id === barber.id && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedBarber(barber);
                  setShowBarberModal(false);
                }}
              >
                <Users size={20} color="#6B7280" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{barber.name}</Text>
                  <Text style={styles.serviceDetails}>
                    {barber.specialties.join(', ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {barbers.length === 0 && (
              <View style={styles.emptyState}>
                <Users size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>Nenhum barbeiro disponível</Text>
                <Text style={styles.emptySubtext}>
                  Adicione barbeiros à sua equipe em Configurações
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showNewClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewClientModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Cliente</Text>
            <TouchableOpacity
              onPress={handleCreateTemporaryClient}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Criar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={newClientForm.name}
                onChangeText={(text) =>
                  setNewClientForm({ ...newClientForm, name: text })
                }
                placeholder="Nome do cliente"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.input}
                value={newClientForm.phone}
                onChangeText={(text) =>
                  setNewClientForm({ ...newClientForm, phone: text })
                }
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.temporaryNote}>
              Este será um cliente temporário. Você poderá completar os dados
              depois.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
