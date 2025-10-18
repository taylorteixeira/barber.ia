import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
} from 'lucide-react-native';

export default function BarberAgenda() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const appointments = [
    {
      id: '1',
      time: '09:00',
      client: 'João Silva',
      service: 'Corte + Barba',
      duration: 60,
      status: 'confirmed',
    },
    {
      id: '2',
      time: '10:30',
      client: 'Pedro Santos',
      service: 'Corte',
      duration: 30,
      status: 'confirmed',
    },
    {
      id: '3',
      time: '11:45',
      client: 'Carlos Lima',
      service: 'Barba',
      duration: 30,
      status: 'confirmed',
    },
    {
      id: '4',
      time: '14:30',
      client: 'Ana Costa',
      service: 'Corte',
      duration: 45,
      status: 'pending',
    },
    {
      id: '5',
      time: '15:45',
      client: 'Rafael Oliveira',
      service: 'Corte + Barba',
      duration: 60,
      status: 'confirmed',
    },
    {
      id: '6',
      time: '17:00',
      client: 'Lucas Ferreira',
      service: 'Corte',
      duration: 30,
      status: 'confirmed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleAddAppointment = () => {
    Alert.alert(
      'Novo Agendamento',
      'Funcionalidade será implementada em breve'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAppointment}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('pt-BR', {
              weekday: 'short',
            });
            const dayNumber = date.getDate();

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dateCard,
                  selectedDate === dateStr && styles.selectedDateCard,
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text
                  style={[
                    styles.dayName,
                    selectedDate === dateStr && styles.selectedDayName,
                  ]}
                >
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === dateStr && styles.selectedDayNumber,
                  ]}
                >
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView
        style={styles.appointmentsList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>
            Agendamentos -{' '}
            {new Date(selectedDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
            })}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {appointments.map((appointment) => (
          <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
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
                  {appointment.status === 'confirmed'
                    ? 'Confirmado'
                    : 'Pendente'}
                </Text>
              </View>
            </View>

            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Ver</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty slots */}
        <View style={styles.emptySlots}>
          <Text style={styles.emptySlotsTitle}>Horários Livres</Text>
          {['12:00', '13:00', '16:30', '18:00'].map((time) => (
            <TouchableOpacity key={time} style={styles.emptySlot}>
              <Text style={styles.emptySlotTime}>{time}</Text>
              <Text style={styles.emptySlotText}>Disponível</Text>
              <Plus size={16} color="#059669" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  },
  dateContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  },
  selectedDateCard: {
    backgroundColor: '#059669',
    borderColor: '#059669',
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
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  selectedDayNumber: {
    color: '#FFFFFF',
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
  },
  emptySlotText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#065F46',
  },
});
