import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Phone, X, Star } from 'lucide-react-native';
import {
  getBookings,
  Booking,
  getBookingsByUserId,
  getCurrentUser,
  updateBookingStatus,
} from '@/services/database';
import { styles } from './bookings-styles';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();
  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id) {
          const data = await getBookingsByUserId(currentUser.id);
          setBookings(data);
        } else {
          const data = await getBookings();
          setBookings(data);
        }
      } catch (err) {
        console.error('Failed to load bookings:', err);
      }
    };
    load();
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await updateBookingStatus(
                bookingId,
                'cancelled',
                'client'
              );

              if (success) {
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === bookingId
                      ? { ...b, status: 'cancelled' as const }
                      : b
                  )
                );

                Alert.alert(
                  'Agendamento cancelado',
                  'Seu agendamento foi cancelado com sucesso. O barbeiro será notificado.'
                );
              } else {
                Alert.alert(
                  'Erro',
                  'Não foi possível cancelar o agendamento. Tente novamente.'
                );
              }
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao cancelar o agendamento.');
            }
          },
        },
      ]
    );
  };

  const handleRateService = (bookingId: string) => {
    // @ts-ignore: suppress routing type error
    router.push(`/review/${bookingId}`);
  };

  const handleCompleteBooking = async (bookingId: string) => {
    Alert.alert(
      'Marcar como Concluído',
      'Confirma que este serviço foi realizado?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, concluído',
          onPress: async () => {
            try {
              const success = await updateBookingStatus(
                bookingId,
                'completed',
                'client'
              );

              if (success) {
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === bookingId
                      ? { ...b, status: 'completed' as const }
                      : b
                  )
                );

                Alert.alert(
                  'Serviço concluído',
                  'Obrigado! Esperamos vê-lo novamente em breve.'
                );
              } else {
                Alert.alert(
                  'Erro',
                  'Não foi possível atualizar o status. Tente novamente.'
                );
              }
            } catch (error) {
              console.error('Error completing booking:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao atualizar o status.');
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image
          source={{ uri: booking.barberImage }}
          style={styles.barberImage}
        />
        <View style={styles.bookingInfo}>
          <Text style={styles.barberName}>{booking.barberName}</Text>
          <Text style={styles.serviceName}>{booking.service}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(booking.status)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.priceText}>R$ {booking.price}</Text>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {new Date(booking.date).toLocaleDateString('pt-BR')} às
            {booking.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.phone}</Text>
        </View>
      </View>
      <View style={styles.bookingActions}>
        {booking.status === 'confirmed' && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(booking.id)}
            >
              <X size={16} color="#EF4444" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteBooking(booking.id)}
            >
              <Clock size={16} color="#10B981" />
              <Text style={styles.completeButtonText}>Concluído</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={16} color="#2563EB" />
              <Text style={styles.contactButtonText}>Contato</Text>
            </TouchableOpacity>
          </>
        )}
        {booking.status === 'completed' && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleRateService(booking.id)}
          >
            <Star size={16} color="#F59E0B" />
            <Text style={styles.rateButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Próximos ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Histórico ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'upcoming' ? (
          upcomingBookings.length > 0 ? (
            upcomingBookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>
                Nenhum agendamento próximo
              </Text>
              <Text style={styles.emptyStateText}>
                Quando você agendar um serviço, ele aparecerá aqui
              </Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.bookButtonText}>Agendar agora</Text>
              </TouchableOpacity>
            </View>
          )
        ) : pastBookings.length > 0 ? (
          pastBookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyState}>
            <Clock size={48} color="#6B7280" />
            <Text style={styles.emptyStateTitle}>Nenhum histórico ainda</Text>
            <Text style={styles.emptyStateText}>
              Seus agendamentos concluídos aparecerão aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
