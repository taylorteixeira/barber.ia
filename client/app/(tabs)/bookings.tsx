import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Phone, X, Star } from 'lucide-react-native';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  // Load bookings from database
  useEffect(() => {
    axios
      .get('http://localhost:5000/booking')
      .then((res: any) => setBookings(res.data))
      .catch(() => setBookings([]));
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

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => {
            // update status and persist
            const updated = bookings.find((b) => b.id === bookingId);
            if (updated) {
              const changed = { ...updated, status: 'cancelled' as const };
              // Chamada axios para atualizar o agendamento no backend
              axios
                .put(`http://localhost:5000/booking/${bookingId}`, changed)
                .then(() => {
                  setBookings((prev) =>
                    prev.map((b) => (b.id === bookingId ? changed : b))
                  );
                  Alert.alert(
                    'Agendamento cancelado',
                    'Seu agendamento foi cancelado com sucesso'
                  );
                })
                .catch(() => {
                  Alert.alert(
                    'Erro',
                    'Ocorreu um erro ao cancelar o agendamento. Tente novamente mais tarde.'
                  );
                });
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

  const renderBookingCard = (booking: any) => (
    // @ts-ignore: suppress key prop error
    <View key={String(booking.id)} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image
          source={{ uri: String(booking.barberImage ?? '') }}
          style={styles.barberImage}
        />
        <View style={styles.bookingInfo}>
          <Text style={styles.barberName}>{String(booking.barberName ?? '')}</Text>
          <Text style={styles.serviceText}>{String(booking.service ?? '')}</Text>
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
        <Text style={styles.priceText}>R$ {String(booking.price ?? '')}</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {String(new Date(booking.date).toLocaleDateString('pt-BR'))} às{' '}
            {String(booking.time ?? '')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{String(booking.address ?? '')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.detailText}>{String(booking.phone ?? '')}</Text>
        </View>
      </View>

      <View style={styles.bookingActions}>
        {booking.status === 'confirmed' && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(String(booking.id))}
            >
              <X size={16} color="#EF4444" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
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
            onPress={() => handleRateService(String(booking.id))}
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
            {/* Corrigido: garantir que não há texto solto aqui */}
            {/* Se quiser adicionar texto, sempre dentro de <Text> */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  barberImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginLeft: 4,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  rateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  bookButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
