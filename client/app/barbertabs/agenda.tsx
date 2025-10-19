import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  User,
  Phone,
  DollarSign,
  X,
  Edit,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
} from 'lucide-react-native';
import {
  exportAppointments,
  getPredefinedPeriods,
  AppointmentExport,
  ExportOptions,
} from '../../services/exportService';
import {
  getAppointmentsForCurrentBarber,
  updateBookingStatus,
} from '../../services/database';
import { styles } from './agenda-styles';

interface AppointmentDetail {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  phone: string;
  email?: string;
  price: number;
  notes?: string;
  createdAt: string;
  date: string;
}

export default function BarberAgenda() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>(
    'csv'
  );
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });
  useEffect(() => {
    let isMounted = true;

    const loadAppointmentsData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        const data = await getAppointmentsForCurrentBarber();

        if (!isMounted) return;

        const formattedAppointments: AppointmentDetail[] = data.map((apt) => {
          const clientName = apt.notes?.includes('Cliente:')
            ? apt.notes.split('Cliente: ')[1].split(' (')[0]
            : 'Cliente';
          const phone =
            apt.notes?.includes('Cliente:') && apt.notes.includes('(')
              ? apt.notes.split('(')[1].split(')')[0]
              : '';
          const service = apt.notes?.includes('Serviço:')
            ? apt.notes.split('Serviço: ')[1].split(' -')[0]
            : 'Serviço';
          const price = apt.notes?.includes('Valor: R$ ')
            ? parseInt(apt.notes.split('Valor: R$ ')[1].split(' ')[0]) || 0
            : 0;
          const email = apt.notes?.includes('Email:')
            ? apt.notes.split('Email: ')[1].trim()
            : '';

          return {
            id: apt.id,
            time: apt.time,
            client: clientName,
            service: service,
            duration: 30,
            status: apt.status as any,
            phone: phone,
            email: email,
            price: price,
            notes: apt.notes || '',
            createdAt: apt.createdAt,
            date: apt.date,
          };
        });

        if (isMounted) {
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        if (isMounted) {
          Alert.alert('Erro', 'Erro ao carregar agendamentos');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAppointmentsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsForCurrentBarber();

      const formattedAppointments: AppointmentDetail[] = data.map((apt) => {
        const clientName = apt.notes?.includes('Cliente:')
          ? apt.notes.split('Cliente: ')[1].split(' (')[0]
          : 'Cliente';
        const phone =
          apt.notes?.includes('Cliente:') && apt.notes.includes('(')
            ? apt.notes.split('(')[1].split(')')[0]
            : '';
        const service = apt.notes?.includes('Serviço:')
          ? apt.notes.split('Serviço: ')[1].split(' -')[0]
          : 'Serviço';
        const price = apt.notes?.includes('Valor: R$ ')
          ? parseInt(apt.notes.split('Valor: R$ ')[1].split(' ')[0]) || 0
          : 0;
        const email = apt.notes?.includes('Email:')
          ? apt.notes.split('Email: ')[1].trim()
          : '';

        return {
          id: apt.id,
          time: apt.time,
          client: clientName,
          service: service,
          duration: 30,
          status: apt.status as any,
          phone: phone,
          email: email,
          price: price,
          notes: apt.notes || '',
          createdAt: apt.createdAt,
          date: apt.date,
        };
      });

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Erro', 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#6366F1';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };
  const handleAddAppointment = () => {
    router.push('/(barbertabs)/new-appointment' as any);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(
      currentWeekStart.getDate() + (direction === 'next' ? 7 : -7)
    );
    setCurrentWeekStart(newWeekStart);

    const newWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(newWeekStart);
      date.setDate(newWeekStart.getDate() + i);
      newWeekDays.push(date.toISOString().split('T')[0]);
    }

    if (!newWeekDays.includes(selectedDate)) {
      setSelectedDate(newWeekDays[0]);
    }
  };
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((appointment) => appointment.date === date);
  };

  const getTotalAppointmentsForWeek = () => {
    const weekDays = getWeekDays();
    let total = 0;
    weekDays.forEach((day) => {
      const dayStr = day.toISOString().split('T')[0];
      total += getAppointmentsForDate(dayStr).length;
    });
    return total;
  };

  const openAppointmentDetails = (appointment: AppointmentDetail) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };
  const handleUpdateStatus = async (
    newStatus: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    if (!selectedAppointment) return;

    let title = '';
    let message = '';

    switch (newStatus) {
      case 'confirmed':
        title = 'Confirmar Agendamento';
        message = `Tem certeza que deseja confirmar o agendamento de ${selectedAppointment.client}?`;
        break;
      case 'cancelled':
        title = 'Cancelar Agendamento';
        message = `Tem certeza que deseja cancelar o agendamento de ${selectedAppointment.client}?\n\nO cliente será notificado automaticamente.`;
        break;
      case 'completed':
        title = 'Concluir Agendamento';
        message = `Confirmar que o atendimento de ${selectedAppointment.client} foi concluído?`;
        break;
    }

    Alert.alert(title, message, [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            let bookingId = selectedAppointment.id;
            if (bookingId.startsWith('booking_')) {
              bookingId = bookingId.replace('booking_', '');
            }

            const success = await updateBookingStatus(
              bookingId,
              newStatus === 'confirmed'
                ? 'confirmed'
                : newStatus === 'cancelled'
                ? 'cancelled'
                : 'completed',
              'barber'
            );

            if (success) {
              setAppointments((prev) =>
                prev.map((apt) =>
                  apt.id === selectedAppointment.id
                    ? { ...apt, status: newStatus }
                    : apt
                )
              );

              Alert.alert(
                'Sucesso',
                `Agendamento ${getStatusText(
                  newStatus
                ).toLowerCase()} com sucesso! O cliente foi notificado.`
              );
            } else {
              Alert.alert(
                'Erro',
                'Não foi possível atualizar o agendamento. Tente novamente.'
              );
            }
          } catch (error) {
            console.error('Error updating appointment status:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar o agendamento.');
          }

          closeModal();
        },
      },
    ]);
  };
  const handleCallClient = () => {
    if (selectedAppointment) {
      Alert.alert(
        'Ligar para Cliente',
        `Ligar para ${selectedAppointment.client}?\n${selectedAppointment.phone}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ligar',
            onPress: () => {
              Alert.alert(
                'Funcionalidade',
                'Integração com telefone será implementada'
              );
            },
          },
        ]
      );
    }
  };

  const openExportModal = () => {
    const predefinedPeriods = getPredefinedPeriods();
    setExportStartDate(predefinedPeriods.thisMonth.startDate);
    setExportEndDate(predefinedPeriods.thisMonth.endDate);
    setExportModalVisible(true);
  };

  const closeExportModal = () => {
    setExportModalVisible(false);
    setExportFormat('csv');
    setExportStartDate('');
    setExportEndDate('');
    setExportStatus([]);
  };

  const handleExport = async () => {
    if (!exportStartDate || !exportEndDate) {
      Alert.alert('Erro', 'Selecione as datas de início e fim');
      return;
    }

    if (new Date(exportStartDate) > new Date(exportEndDate)) {
      Alert.alert('Erro', 'A data de início deve ser menor que a data de fim');
      return;
    }

    setIsExporting(true);

    try {
      const appointmentsToExport: AppointmentExport[] = appointments.map(
        (apt) => ({
          id: apt.id,
          date: apt.date,
          time: apt.time,
          client: apt.client,
          service: apt.service,
          duration: apt.duration,
          status: apt.status,
          phone: apt.phone,
          email: apt.email,
          price: apt.price,
          notes: apt.notes,
          createdAt: apt.createdAt,
          barber: 'Proprietário',
        })
      );

      const exportOptions: ExportOptions = {
        format: exportFormat,
        startDate: exportStartDate,
        endDate: exportEndDate,
        status: exportStatus.length > 0 ? exportStatus : undefined,
      };

      await exportAppointments(appointmentsToExport, exportOptions);
      closeExportModal();
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExportStatus = (status: string) => {
    setExportStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const setPredefinedPeriod = (
    period: keyof ReturnType<typeof getPredefinedPeriods>
  ) => {
    const periods = getPredefinedPeriods();
    const selectedPeriod = periods[period];
    setExportStartDate(selectedPeriod.startDate);
    setExportEndDate(selectedPeriod.endDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={openExportModal}
          >
            <Download size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAppointment}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.dateContainer}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek('prev')}
          >
            <ChevronLeft size={20} color="#059669" />
          </TouchableOpacity>

          <View style={styles.weekInfo}>
            <Text style={styles.weekRange}>
              {currentWeekStart.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
              -
              {new Date(
                currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </Text>
            <Text style={styles.weekTotal}>
              {getTotalAppointmentsForWeek()} agendamentos
            </Text>
          </View>

          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek('next')}
          >
            <ChevronRight size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysScrollView}
        >
          {getWeekDays().map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('pt-BR', {
              weekday: 'short',
            });
            const dayNumber = date.getDate();
            const appointmentsCount = getAppointmentsForDate(dateStr).length;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dateCard,
                  selectedDate === dateStr && styles.selectedDateCard,
                  isToday && styles.todayDateCard,
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text
                  style={[
                    styles.dayName,
                    selectedDate === dateStr && styles.selectedDayName,
                    isToday && styles.todayDayName,
                  ]}
                >
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === dateStr && styles.selectedDayNumber,
                    isToday && styles.todayDayNumber,
                  ]}
                >
                  {dayNumber}
                </Text>
                {appointmentsCount > 0 && (
                  <View
                    style={[
                      styles.appointmentsBadge,
                      selectedDate === dateStr &&
                        styles.selectedAppointmentsBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.appointmentsBadgeText,
                        selectedDate === dateStr &&
                          styles.selectedAppointmentsBadgeText,
                      ]}
                    >
                      {appointmentsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.appointmentsList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>
            Agendamentos -
            {new Date(selectedDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              weekday: 'long',
            })}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {getAppointmentsForDate(selectedDate).length > 0 ? (
          getAppointmentsForDate(selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => openAppointmentDetails(appointment)}
              >
                <View style={styles.timeColumn}>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  <View style={styles.durationContainer}>
                    <Clock size={12} color="#6B7280" />
                    <Text style={styles.durationText}>
                      {appointment.duration}min
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <Text style={styles.clientName}>{appointment.client}</Text>
                  <Text style={styles.serviceText}>{appointment.service}</Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(appointment.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(appointment.status) },
                      ]}
                    >
                      {getStatusText(appointment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentActions}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Ver</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.emptyDay}>
            <CalendarIcon size={48} color="#D1D5DB" />
            <Text style={styles.emptyDayTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptyDayText}>
              Não há agendamentos para
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
              })}
            </Text>
            <TouchableOpacity
              style={styles.addAppointmentButton}
              onPress={handleAddAppointment}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addAppointmentButtonText}>
                Novo Agendamento
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {getAppointmentsForDate(selectedDate).length > 0 && (
          <View style={styles.emptySlots}>
            <Text style={styles.emptySlotsTitle}>Horários Livres</Text>
            {['12:00', '13:00', '16:30', '18:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.emptySlot}
                onPress={handleAddAppointment}
              >
                <Text style={styles.emptySlotTime}>{time}</Text>
                <Text style={styles.emptySlotText}>Disponível</Text>
                <Plus size={16} color="#059669" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAppointment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalhes do Agendamento</Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cliente</Text>
                    <View style={styles.clientCard}>
                      <View style={styles.clientHeader}>
                        <View style={styles.clientInfo}>
                          <View style={styles.infoRow}>
                            <User size={20} color="#059669" />
                            <Text style={styles.clientNameModal}>
                              {selectedAppointment.client}
                            </Text>
                          </View>
                          <View style={styles.statusRow}>
                            <View
                              style={[
                                styles.statusIndicator,
                                {
                                  backgroundColor: getStatusColor(
                                    selectedAppointment.status
                                  ),
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusTextModal,
                                {
                                  color: getStatusColor(
                                    selectedAppointment.status
                                  ),
                                },
                              ]}
                            >
                              {getStatusText(selectedAppointment.status)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.contactInfo}>
                        <View style={styles.infoRow}>
                          <Phone size={18} color="#6B7280" />
                          <Text style={styles.infoText}>
                            {selectedAppointment.phone}
                          </Text>
                          <TouchableOpacity
                            onPress={handleCallClient}
                            style={styles.callButton}
                          >
                            <Phone size={14} color="#FFFFFF" />
                            <Text style={styles.callButtonText}>Ligar</Text>
                          </TouchableOpacity>
                        </View>
                        {selectedAppointment.email && (
                          <View style={styles.infoRow}>
                            <MessageSquare size={18} color="#6B7280" />
                            <Text style={styles.infoText}>
                              {selectedAppointment.email}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Serviço e Horário</Text>
                    <View style={styles.serviceCard}>
                      <View style={styles.serviceHeader}>
                        <Text style={styles.serviceName}>
                          {selectedAppointment.service}
                        </Text>
                        <View style={styles.priceTag}>
                          <DollarSign size={16} color="#059669" />
                          <Text style={styles.priceText}>
                            R$ {selectedAppointment.price.toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.timeDetails}>
                        <View style={styles.timeItem}>
                          <Clock size={16} color="#6B7280" />
                          <Text style={styles.timeText}>
                            Horário: {selectedAppointment.time}
                          </Text>
                        </View>
                        <View style={styles.timeItem}>
                          <CalendarIcon size={16} color="#6B7280" />
                          <Text style={styles.timeText}>
                            Duração: {selectedAppointment.duration} min
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {selectedAppointment.notes && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Observações</Text>
                      <View style={styles.notesCard}>
                        <MessageSquare size={18} color="#F59E0B" />
                        <Text
                          style={[styles.notesText, { marginLeft: 8, flex: 1 }]}
                        >
                          {selectedAppointment.notes}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Detalhes do Agendamento
                    </Text>
                    <View style={styles.additionalCard}>
                      <Text style={styles.additionalLabel}>Agendado em:</Text>
                      <Text style={styles.additionalValue}>
                        {new Date(
                          selectedAppointment.createdAt
                        ).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={styles.additionalLabel}>
                        ID do Agendamento:
                      </Text>
                      <Text style={styles.additionalValue}>
                        #{selectedAppointment.id}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                <View style={styles.modalActions}>
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionModalButton, styles.confirmButton]}
                        onPress={() => handleUpdateStatus('confirmed')}
                      >
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>
                          Confirmar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionModalButton, styles.cancelButton]}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        <XCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.actionModalButton,
                          styles.completeButton,
                        ]}
                        onPress={() => handleUpdateStatus('completed')}
                      >
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>
                          Concluir
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionModalButton, styles.cancelButton]}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        <XCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {(selectedAppointment.status === 'completed' ||
                    selectedAppointment.status === 'cancelled') && (
                    <TouchableOpacity
                      style={[styles.actionModalButton, styles.editButton]}
                      onPress={() =>
                        Alert.alert(
                          'Editar',
                          'Funcionalidade de edição será implementada'
                        )
                      }
                    >
                      <Edit size={18} color="#FFFFFF" />
                      <Text style={styles.actionModalButtonText}>Editar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={exportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeExportModal}
      >
        <View style={styles.exportModalContent}>
          <View style={styles.exportModalHeader}>
            <Text style={styles.exportModalTitle}>Exportar Agendamentos</Text>
            <TouchableOpacity onPress={closeExportModal}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.exportSection}>
              <Text style={styles.exportSectionTitle}>Formato do Arquivo</Text>
              <View style={styles.formatButtons}>
                <TouchableOpacity
                  style={[
                    styles.formatButton,
                    exportFormat === 'csv' && styles.formatButtonSelected,
                  ]}
                  onPress={() => setExportFormat('csv')}
                >
                  <FileText
                    size={16}
                    color={exportFormat === 'csv' ? '#059669' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.formatButtonText,
                      exportFormat === 'csv' && styles.formatButtonTextSelected,
                    ]}
                  >
                    CSV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.formatButton,
                    exportFormat === 'excel' && styles.formatButtonSelected,
                  ]}
                  onPress={() => setExportFormat('excel')}
                >
                  <FileText
                    size={16}
                    color={exportFormat === 'excel' ? '#059669' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.formatButtonText,
                      exportFormat === 'excel' &&
                        styles.formatButtonTextSelected,
                    ]}
                  >
                    Excel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.formatButton,
                    exportFormat === 'pdf' && styles.formatButtonSelected,
                  ]}
                  onPress={() => setExportFormat('pdf')}
                >
                  <FileText
                    size={16}
                    color={exportFormat === 'pdf' ? '#059669' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.formatButtonText,
                      exportFormat === 'pdf' && styles.formatButtonTextSelected,
                    ]}
                  >
                    PDF
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.exportSection}>
              <Text style={styles.exportSectionTitle}>Período</Text>
              <View style={styles.periodButtons}>
                {Object.entries(getPredefinedPeriods()).map(([key, period]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.periodButton,
                      exportStartDate === period.startDate &&
                        exportEndDate === period.endDate &&
                        styles.periodButtonSelected,
                    ]}
                    onPress={() => setPredefinedPeriod(key as any)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        exportStartDate === period.startDate &&
                          exportEndDate === period.endDate &&
                          styles.periodButtonTextSelected,
                      ]}
                    >
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.dateInputs}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Data Início</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={exportStartDate}
                    onChangeText={setExportStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Data Fim</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={exportEndDate}
                    onChangeText={setExportEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.exportSection}>
              <Text style={styles.exportSectionTitle}>Status (Opcional)</Text>
              <View style={styles.statusFilters}>
                {[
                  { key: 'confirmed', label: 'Confirmado' },
                  { key: 'pending', label: 'Pendente' },
                  { key: 'completed', label: 'Concluído' },
                  { key: 'cancelled', label: 'Cancelado' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusFilter,
                      exportStatus.includes(status.key) &&
                        styles.statusFilterSelected,
                    ]}
                    onPress={() => toggleExportStatus(status.key)}
                  >
                    <Text
                      style={[
                        styles.statusFilterText,
                        exportStatus.includes(status.key) &&
                          styles.statusFilterTextSelected,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.dateLabel}>
                {exportStatus.length === 0
                  ? 'Todos os status serão incluídos'
                  : `${exportStatus.length} status selecionados`}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.exportModalActions}>
            <TouchableOpacity
              style={styles.exportCancelButton}
              onPress={closeExportModal}
            >
              <Text style={styles.exportCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.exportConfirmButton,
                isExporting && styles.exportConfirmButtonDisabled,
              ]}
              onPress={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Download size={16} color="#FFFFFF" />
              )}
              <Text style={styles.exportConfirmButtonText}>
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
