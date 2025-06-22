import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Filter, 
  User, 
  Phone, 
  MapPin,
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
  Calendar,
  Settings
} from 'lucide-react-native';
import { exportAppointments, getPredefinedPeriods, AppointmentExport, ExportOptions } from '../../services/exportService';

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
  const router = useRouter();  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para exportação
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Começar na segunda-feira
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });
    const appointments: AppointmentDetail[] = [
    { 
      id: '1', 
      time: '09:00', 
      client: 'João Silva', 
      service: 'Corte + Barba', 
      duration: 60, 
      status: 'confirmed',
      phone: '(11) 99999-1111',
      email: 'joao@email.com',
      price: 45,
      notes: 'Cliente prefere barba mais curta',
      createdAt: '2025-06-22T10:30:00Z',
      date: '2025-06-22'
    },
    { 
      id: '2', 
      time: '10:30', 
      client: 'Pedro Santos', 
      service: 'Corte', 
      duration: 30, 
      status: 'confirmed',
      phone: '(11) 99999-2222',
      price: 25,
      createdAt: '2025-06-22T09:15:00Z',
      date: '2025-06-22'
    },
    { 
      id: '3', 
      time: '11:45', 
      client: 'Carlos Lima', 
      service: 'Barba', 
      duration: 30, 
      status: 'confirmed',
      phone: '(11) 99999-3333',
      email: 'carlos@email.com',
      price: 20,
      createdAt: '2025-06-21T16:20:00Z',
      date: '2025-06-23'
    },
    { 
      id: '4', 
      time: '14:30', 
      client: 'Ana Costa', 
      service: 'Corte', 
      duration: 45, 
      status: 'pending',
      phone: '(11) 99999-4444',
      price: 25,
      notes: 'Primeira vez na barbearia',
      createdAt: '2025-06-22T12:00:00Z',
      date: '2025-06-23'
    },
    { 
      id: '5', 
      time: '15:45', 
      client: 'Rafael Oliveira', 
      service: 'Corte + Barba', 
      duration: 60, 
      status: 'confirmed',
      phone: '(11) 99999-5555',
      email: 'rafael@email.com',
      price: 45,
      createdAt: '2025-06-20T14:30:00Z',
      date: '2025-06-24'
    },
    { 
      id: '6', 
      time: '17:00', 
      client: 'Lucas Ferreira', 
      service: 'Corte', 
      duration: 30, 
      status: 'confirmed',
      phone: '(11) 99999-6666',
      price: 25,
      createdAt: '2025-06-22T11:45:00Z',
      date: '2025-06-24'
    },
    { 
      id: '7', 
      time: '09:30', 
      client: 'Marina Santos', 
      service: 'Corte Feminino', 
      duration: 45, 
      status: 'pending',
      phone: '(11) 99999-7777',
      email: 'marina@email.com',
      price: 35,
      createdAt: '2025-06-22T08:00:00Z',
      date: '2025-06-25'
    },
    { 
      id: '8', 
      time: '16:00', 
      client: 'Roberto Silva', 
      service: 'Barba + Bigode', 
      duration: 40, 
      status: 'confirmed',
      phone: '(11) 99999-8888',
      price: 30,
      notes: 'Cliente tem alergia a alguns produtos',
      createdAt: '2025-06-21T15:20:00Z',
      date: '2025-06-26'
    },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };  const handleAddAppointment = () => {
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
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
    
    // Atualizar a data selecionada para o primeiro dia da nova semana se necessário
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
    return appointments.filter(appointment => appointment.date === date);
  };

  const getTotalAppointmentsForWeek = () => {
    const weekDays = getWeekDays();
    let total = 0;
    weekDays.forEach(day => {
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
  const handleUpdateStatus = (newStatus: 'confirmed' | 'cancelled' | 'completed') => {
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
        message = `Tem certeza que deseja cancelar o agendamento de ${selectedAppointment.client}?\n\nEsta ação não pode ser desfeita.`;
        break;
      case 'completed':
        title = 'Concluir Agendamento';
        message = `Confirmar que o atendimento de ${selectedAppointment.client} foi concluído?`;
        break;
    }

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: () => {
            // Aqui você atualizaria o status no banco de dados
            Alert.alert(
              'Sucesso',
              `Agendamento ${getStatusText(newStatus).toLowerCase()} com sucesso!`
            );
            closeModal();
          }
        }
      ]
    );
  };
  const handleCallClient = () => {
    if (selectedAppointment) {
      Alert.alert(
        'Ligar para Cliente',
        `Ligar para ${selectedAppointment.client}?\n${selectedAppointment.phone}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ligar', onPress: () => {
            // Aqui você implementaria a funcionalidade de chamada
            Alert.alert('Funcionalidade', 'Integração com telefone será implementada');
          }}
        ]
      );
    }
  };

  // Funções de exportação
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
      // Converter agendamentos para o formato de exportação
      const appointmentsToExport: AppointmentExport[] = appointments.map(apt => ({
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
        barber: 'Proprietário', // Por enquanto assumindo que é sempre o proprietário
      }));

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
    setExportStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const setPredefinedPeriod = (period: keyof ReturnType<typeof getPredefinedPeriods>) => {
    const periods = getPredefinedPeriods();
    const selectedPeriod = periods[period];
    setExportStartDate(selectedPeriod.startDate);
    setExportEndDate(selectedPeriod.endDate);
  };

  return (
    <SafeAreaView style={styles.container}>      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={openExportModal}>
            <Download size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>{/* Date Selector */}
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
              {currentWeekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
                .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScrollView}>
          {getWeekDays().map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            const dayNumber = date.getDate();
            const appointmentsCount = getAppointmentsForDate(dateStr).length;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dateCard,
                  selectedDate === dateStr && styles.selectedDateCard,
                  isToday && styles.todayDateCard
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[
                  styles.dayName,
                  selectedDate === dateStr && styles.selectedDayName,
                  isToday && styles.todayDayName
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  selectedDate === dateStr && styles.selectedDayNumber,
                  isToday && styles.todayDayNumber
                ]}>
                  {dayNumber}
                </Text>
                {appointmentsCount > 0 && (
                  <View style={[
                    styles.appointmentsBadge,
                    selectedDate === dateStr && styles.selectedAppointmentsBadge
                  ]}>
                    <Text style={[
                      styles.appointmentsBadgeText,
                      selectedDate === dateStr && styles.selectedAppointmentsBadgeText
                    ]}>
                      {appointmentsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>      {/* Appointments List */}
      <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>
            Agendamentos - {new Date(selectedDate).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long',
              weekday: 'long'
            })}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>        {getAppointmentsForDate(selectedDate).length > 0 ? (
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
                  <Text style={styles.durationText}>{appointment.duration}min</Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <Text style={styles.clientName}>{appointment.client}</Text>
                <Text style={styles.serviceText}>{appointment.service}</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(appointment.status) }
                  ]}>
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
              Não há agendamentos para {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long' 
              })}
            </Text>
            <TouchableOpacity 
              style={styles.addAppointmentButton}
              onPress={handleAddAppointment}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addAppointmentButtonText}>Novo Agendamento</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Available time slots */}
        {getAppointmentsForDate(selectedDate).length > 0 && (
          <View style={styles.emptySlots}>
            <Text style={styles.emptySlotsTitle}>Horários Livres</Text>
            {['12:00', '13:00', '16:30', '18:00'].map((time) => (
              <TouchableOpacity key={time} style={styles.emptySlot} onPress={handleAddAppointment}>
                <Text style={styles.emptySlotTime}>{time}</Text>
                <Text style={styles.emptySlotText}>Disponível</Text>
                <Plus size={16} color="#059669" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalhes do Agendamento */}
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
                {/* Header do Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalhes do Agendamento</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Informações do Cliente */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cliente</Text>
                    <View style={styles.clientCard}>
                      <View style={styles.clientHeader}>
                        <View style={styles.clientInfo}>
                          <View style={styles.infoRow}>
                            <User size={20} color="#059669" />
                            <Text style={styles.clientNameModal}>{selectedAppointment.client}</Text>
                          </View>
                          <View style={styles.statusRow}>
                            <View style={[
                              styles.statusIndicator,
                              { backgroundColor: getStatusColor(selectedAppointment.status) }
                            ]} />
                            <Text style={[
                              styles.statusTextModal,
                              { color: getStatusColor(selectedAppointment.status) }
                            ]}>
                              {getStatusText(selectedAppointment.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.contactInfo}>
                        <View style={styles.infoRow}>
                          <Phone size={18} color="#6B7280" />
                          <Text style={styles.infoText}>{selectedAppointment.phone}</Text>
                          <TouchableOpacity onPress={handleCallClient} style={styles.callButton}>
                            <Phone size={14} color="#FFFFFF" />
                            <Text style={styles.callButtonText}>Ligar</Text>
                          </TouchableOpacity>
                        </View>
                        {selectedAppointment.email && (
                          <View style={styles.infoRow}>
                            <MessageSquare size={18} color="#6B7280" />
                            <Text style={styles.infoText}>{selectedAppointment.email}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Informações do Serviço */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Serviço e Horário</Text>
                    <View style={styles.serviceCard}>
                      <View style={styles.serviceHeader}>
                        <Text style={styles.serviceName}>{selectedAppointment.service}</Text>
                        <View style={styles.priceTag}>
                          <DollarSign size={16} color="#059669" />
                          <Text style={styles.priceText}>R$ {selectedAppointment.price.toFixed(2)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.timeDetails}>
                        <View style={styles.timeItem}>
                          <Clock size={16} color="#6B7280" />
                          <Text style={styles.timeText}>Horário: {selectedAppointment.time}</Text>
                        </View>
                        <View style={styles.timeItem}>
                          <CalendarIcon size={16} color="#6B7280" />
                          <Text style={styles.timeText}>Duração: {selectedAppointment.duration} min</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Notas */}                  {selectedAppointment.notes && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Observações</Text>
                      <View style={styles.notesCard}>
                        <MessageSquare size={18} color="#F59E0B" />
                        <Text style={[styles.notesText, { marginLeft: 8, flex: 1 }]}>{selectedAppointment.notes}</Text>
                      </View>
                    </View>
                  )}

                  {/* Informações Adicionais */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalhes do Agendamento</Text>
                    <View style={styles.additionalCard}>
                      <Text style={styles.additionalLabel}>Agendado em:</Text>
                      <Text style={styles.additionalValue}>
                        {new Date(selectedAppointment.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      <Text style={styles.additionalLabel}>ID do Agendamento:</Text>
                      <Text style={styles.additionalValue}>#{selectedAppointment.id}</Text>
                    </View>
                  </View>
                </ScrollView>                {/* Ações do Modal */}
                <View style={styles.modalActions}>
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionModalButton, styles.confirmButton]}
                        onPress={() => handleUpdateStatus('confirmed')}
                      >
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>Confirmar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionModalButton, styles.cancelButton]}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        <XCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {selectedAppointment.status === 'confirmed' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionModalButton, styles.completeButton]}
                        onPress={() => handleUpdateStatus('completed')}
                      >
                        <CheckCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>Concluir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionModalButton, styles.cancelButton]}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        <XCircle size={18} color="#FFFFFF" />
                        <Text style={styles.actionModalButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && (
                    <TouchableOpacity 
                      style={[styles.actionModalButton, styles.editButton]}
                      onPress={() => Alert.alert('Editar', 'Funcionalidade de edição será implementada')}
                    >
                      <Edit size={18} color="#FFFFFF" />
                      <Text style={styles.actionModalButtonText}>Editar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>      </Modal>

      {/* Modal de Exportação */}
      <Modal
        visible={exportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeExportModal}
      >
        <View style={styles.exportModalContent}>
          {/* Header do Modal */}
          <View style={styles.exportModalHeader}>
            <Text style={styles.exportModalTitle}>Exportar Agendamentos</Text>
            <TouchableOpacity onPress={closeExportModal}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Formato de Arquivo */}
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
                  <FileText size={16} color={exportFormat === 'csv' ? '#059669' : '#6B7280'} />
                  <Text style={[
                    styles.formatButtonText,
                    exportFormat === 'csv' && styles.formatButtonTextSelected,
                  ]}>CSV</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatButton,
                    exportFormat === 'excel' && styles.formatButtonSelected,
                  ]}
                  onPress={() => setExportFormat('excel')}
                >
                  <FileText size={16} color={exportFormat === 'excel' ? '#059669' : '#6B7280'} />
                  <Text style={[
                    styles.formatButtonText,
                    exportFormat === 'excel' && styles.formatButtonTextSelected,
                  ]}>Excel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatButton,
                    exportFormat === 'pdf' && styles.formatButtonSelected,
                  ]}
                  onPress={() => setExportFormat('pdf')}
                >
                  <FileText size={16} color={exportFormat === 'pdf' ? '#059669' : '#6B7280'} />
                  <Text style={[
                    styles.formatButtonText,
                    exportFormat === 'pdf' && styles.formatButtonTextSelected,
                  ]}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Período */}
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
                    <Text style={[
                      styles.periodButtonText,
                      exportStartDate === period.startDate && 
                      exportEndDate === period.endDate && 
                      styles.periodButtonTextSelected,
                    ]}>
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

            {/* Filtros de Status */}
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
                      exportStatus.includes(status.key) && styles.statusFilterSelected,
                    ]}
                    onPress={() => toggleExportStatus(status.key)}
                  >
                    <Text style={[
                      styles.statusFilterText,
                      exportStatus.includes(status.key) && styles.statusFilterTextSelected,
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.dateLabel}>
                {exportStatus.length === 0 ? 'Todos os status serão incluídos' : `${exportStatus.length} status selecionados`}
              </Text>
            </View>
          </ScrollView>

          {/* Ações do Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },  dateContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weekNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  weekInfo: {
    alignItems: 'center',
    flex: 1,
  },
  weekRange: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  weekTotal: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  daysScrollView: {
    flexGrow: 0,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },  selectedDateCard: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  todayDateCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedDayName: {
    color: '#FFFFFF',
  },
  todayDayName: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  selectedDayNumber: {
    color: '#FFFFFF',
  },
  todayDayNumber: {
    color: '#F59E0B',
  },
  appointmentsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedAppointmentsBadge: {
    backgroundColor: '#FEF3C7',
  },
  appointmentsBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  selectedAppointmentsBadgeText: {
    color: '#92400E',
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  filterButton: {
    padding: 8,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timeColumn: {
    marginRight: 16,
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 2,
  },
  appointmentDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  appointmentActions: {
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  emptySlots: {
    marginTop: 20,
  },
  emptySlotsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptySlot: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emptySlotTime: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginRight: 12,
  },  emptySlotText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#065F46',
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyDayTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addAppointmentButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  callButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  callButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  serviceInfo: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  timeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInfoText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginLeft: 4,
  },  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  additionalInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  actionModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionModalButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  completeButton: {
    backgroundColor: '#6366F1',
  },  editButton: {
    backgroundColor: '#F59E0B',
  },
  // Novos estilos para o modal melhorado
  clientCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clientHeader: {
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameModal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTextModal: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  contactInfo: {
    gap: 8,
  },
  serviceCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    flex: 1,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginLeft: 4,
  },
  timeDetails: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'flex-start',
  },
  additionalCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  additionalLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
    marginTop: 8,
  },  additionalValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  // Estilos para exportação
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  exportModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  exportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  exportModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  exportSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exportSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  formatButtonSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  formatButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  formatButtonTextSelected: {
    color: '#059669',
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  periodButtonTextSelected: {
    color: '#059669',
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statusFilterTextSelected: {
    color: '#059669',
  },
  exportModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  exportCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  exportCancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  exportConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  exportConfirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  exportConfirmButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
