import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Clock, Plus, Filter } from 'lucide-react-native';
import { styles } from './agenda-styles';

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAppointment}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
