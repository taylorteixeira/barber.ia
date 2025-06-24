import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  TrendingDown,
  Camera,
} from 'lucide-react-native';
import { 
  getCurrentUser, 
  getAppointmentsForCurrentBarber,
  getBookingsForCurrentBarbershop,
  getClientsFromBookings,
  getBarbershopByOwnerId,
  Appointment,
  Booking,
  Client
} from '../../services/database';

// TypeScript interfaces
interface DashboardStats {
  todayAppointments: number;
  weekRevenue: number;
  totalClients: number;
  averageRating: number;
  pendingAppointments: number;
  monthlyGrowth: number;
}

interface TopService {
  name: string;
  count: number;
  revenue: number;
}

interface BusyHour {
  hour: string;
  appointments: number;
}

interface DashboardData {
  weeklyComparison: {
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
  topServices: TopService[];
  clientRetention: {
    returning: number;
    new: number;
  };
  dailyRevenue: number[];
  busyHours: BusyHour[];
}

export default function BarberDashboard() {
  const router = useRouter();
  const [barberData, setBarberData] = useState({
    name: 'Carregando...',
    barbershopName: 'Minha Barbearia',
  });  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    weekRevenue: 0,
    totalClients: 0,
    averageRating: 0,
    pendingAppointments: 0,
    monthlyGrowth: 0,
  });

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    weeklyComparison: {
      thisWeek: 0,
      lastWeek: 0,
      growth: 0,
    },
    topServices: [],
    clientRetention: {
      returning: 0,
      new: 0,
    },
    dailyRevenue: [0, 0, 0, 0, 0, 0, 0],
    busyHours: [],
  });

  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    const loadDashboardData = async () => {
      try {
        if (!isMounted) return; // Early return if component unmounted
        setLoading(true);
        const userData = await getCurrentUser();        
        if (userData && isMounted) {
          // Load barbershop info
          const barbershop = await getBarbershopByOwnerId(userData.id!);
          if (!isMounted) return; // Check again after async operation
          
          setBarberData({
            name: userData.name,
            barbershopName: barbershop ? barbershop.name : 'Minha Barbearia',
          });          // Load real appointments data
          const appointments = await getAppointmentsForCurrentBarber();
          const bookings = await getBookingsForCurrentBarbershop();
          const clients = await getClientsFromBookings();
          
          if (!isMounted) return; // Check after all async operations
          
          // Set appointments for use in activity section
          setRecentAppointments(appointments);

          // Calculate today's appointments
          const today = new Date().toISOString().split('T')[0];
          const todayAppointments = appointments.filter(apt => apt.date === today).length;

          // Calculate week revenue from bookings
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const weekBookings = bookings.filter(booking => 
            new Date(booking.date) >= oneWeekAgo && booking.status === 'completed'
          );
          const weekRevenue = weekBookings.reduce((sum, booking) => sum + booking.price, 0);

          // Calculate pending appointments
          const pendingAppointments = appointments.filter(apt => apt.status === 'scheduled').length;

          // Calculate average rating (mock for now since we don't have ratings system)
          const averageRating = bookings.length > 0 ? 4.5 : 0;

          // Calculate top services from bookings
          const serviceStats = new Map<string, { count: number; revenue: number }>();
          bookings.forEach(booking => {
            if (booking.status === 'completed') {
              const existing = serviceStats.get(booking.service) || { count: 0, revenue: 0 };
              serviceStats.set(booking.service, {
                count: existing.count + 1,
                revenue: existing.revenue + booking.price
              });
            }
          });

          const topServices: TopService[] = Array.from(serviceStats.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);          // Calculate busy hours with 3-hour intervals
          const timeSlots = [
            { range: '08:00-11:00', start: 8, end: 11 },
            { range: '11:00-14:00', start: 11, end: 14 },
            { range: '14:00-17:00', start: 14, end: 17 },
            { range: '17:00-20:00', start: 17, end: 20 },
          ];

          const busyHours: BusyHour[] = timeSlots.map(slot => {
            const count = appointments.filter(apt => {
              const hour = parseInt(apt.time.split(':')[0]);
              return hour >= slot.start && hour < slot.end;
            }).length;
            
            return {
              hour: slot.range,
              appointments: count
            };
          }).filter(slot => slot.appointments > 0) // Only show slots with appointments
            .sort((a, b) => b.appointments - a.appointments); // Sort by most busy

          // Calculate client retention (new vs returning)
          const clientBookingCounts = new Map<string, number>();
          bookings.forEach(booking => {
            if (booking.clientName) {
              const count = clientBookingCounts.get(booking.clientName) || 0;
              clientBookingCounts.set(booking.clientName, count + 1);
            }
          });

          const returningClients = Array.from(clientBookingCounts.values()).filter(count => count > 1).length;
          const newClients = Array.from(clientBookingCounts.values()).filter(count => count === 1).length;
          const totalUniqueClients = returningClients + newClients;

          const returningPercentage = totalUniqueClients > 0 ? Math.round((returningClients / totalUniqueClients) * 100) : 0;
          const newPercentage = totalUniqueClients > 0 ? Math.round((newClients / totalUniqueClients) * 100) : 0;

          // Calculate weekly comparison
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const lastWeekAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= twoWeeksAgo && aptDate < oneWeekAgo;
          }).length;

          const thisWeekAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= oneWeekAgo;
          }).length;          const growth = lastWeekAppointments > 0 
            ? Math.round(((thisWeekAppointments - lastWeekAppointments) / lastWeekAppointments) * 100)
            : 0;

          if (!isMounted) return; // Final check before updating state

          // Update states with real data
          setStats({
            todayAppointments,
            weekRevenue,
            totalClients: clients.length,
            averageRating,
            pendingAppointments,
            monthlyGrowth: growth, // Using weekly growth as monthly for now
          });

          setDashboardData({
            weeklyComparison: {
              thisWeek: thisWeekAppointments,
              lastWeek: lastWeekAppointments,
              growth,
            },
            topServices,
            clientRetention: {
              returning: returningPercentage,
              new: newPercentage,
            },
            dailyRevenue: [0, 0, 0, 0, 0, 0, 0], // Would need daily breakdown
            busyHours,
          });

          // Set recent appointments for activity section
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const recentApts = appointments.filter(apt => {
            const aptDate = new Date(apt.date + 'T' + apt.time);
            return aptDate >= yesterday;
          }).sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateB.getTime() - dateA.getTime();
          }).slice(0, 3);          setRecentAppointments(recentApts);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-appointment':
        router.push('/(barbertabs)/new-appointment' as any);
        break;
      case 'manage-services':
        router.push('/(barbertabs)/services' as any);
        break;
      case 'view-agenda':
        router.push('/(barbertabs)/agenda');
        break;
      case 'manage-clients':
        router.push('/(barbertabs)/clients');
        break;
      case 'facecut':
        handleOpenFaceCut();
        break;
      default:
        Alert.alert('Ação', 'Funcionalidade será implementada');
    }
  };

  const handleOpenFaceCut = async () => {
    const url = 'https://facecut-suggestion.vercel.app';
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível abrir o FaceCut. Verifique se você tem um navegador instalado.',
          [
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening FaceCut:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar abrir o FaceCut. Tente novamente.',
        [
          { text: 'OK' }
        ]
      );
    }
  };  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {barberData.name}!</Text>
            <Text style={styles.shopName}>{barberData.barbershopName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(barbertabs)/profile' as any)}
          >
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <>
            {/* Quick Stats - 4 cards principais */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.todayAppointments}</Text>
                <Text style={styles.statLabel}>Hoje</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>R$ {stats.weekRevenue}</Text>
                <Text style={styles.statLabel}>Semana</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Users size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{stats.totalClients}</Text>
                <Text style={styles.statLabel}>Clientes</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Star size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0'}</Text>
                <Text style={styles.statLabel}>Avaliação</Text>
              </View>
            </View>{/* Ações Rápidas */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('new-appointment')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Plus size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Novo Agendamento</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('view-agenda')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Calendar size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Ver Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('manage-services')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Settings size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Gerenciar Serviços</Text>
            </TouchableOpacity>            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('facecut')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Camera size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>FaceCut</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('manage-clients')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Users size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Clientes</Text>
            </TouchableOpacity>
          </View>
        </View>        {/* Atividade Recente */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityCard}>
            {recentAppointments.length === 0 ? (
              <Text style={styles.legendText}>Nenhuma atividade recente</Text>
            ) : (
              recentAppointments.map((booking, index) => {
                const clientName = booking.notes?.includes('Cliente:') ? 
                  booking.notes.split('Cliente: ')[1].split(' (')[0] : 'Cliente';
                const service = booking.notes?.includes('Serviço:') ? 
                  booking.notes.split('Serviço: ')[1].split(' -')[0] : 'Serviço';
                
                const bookingTime = new Date(booking.date + 'T' + booking.time);
                const now = new Date();
                const diffMs = now.getTime() - bookingTime.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                let timeAgo = '';
                if (diffHours > 0) {
                  timeAgo = `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                } else if (diffMins > 0) {
                  timeAgo = `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
                } else {
                  timeAgo = 'Agora mesmo';
                }

                let activityText = '';
                let dotColor = '#10B981';
                
                if (booking.status === 'completed') {
                  activityText = `${clientName} concluiu ${service}`;
                  dotColor = '#6366F1';
                } else if (booking.status === 'cancelled') {
                  activityText = `${clientName} cancelou ${service}`;
                  dotColor = '#EF4444';
                } else {
                  activityText = `${clientName} agendou ${service}`;
                  dotColor = '#10B981';
                }

                return (                  <View key={index} style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: dotColor }]} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activityText}</Text>
                      <Text style={styles.activityTime}>{timeAgo}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Additional Dashboards */}
        <View style={styles.dashboardsSection}>
          <Text style={styles.sectionTitle}>Análises Detalhadas</Text>
          
          {/* Performance Comparison */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <BarChart3 size={20} color="#3B82F6" />
              <Text style={styles.dashboardTitle}>Comparativo Semanal</Text>
            </View>
            <View style={styles.comparisonContent}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Esta semana</Text>
                <Text style={styles.comparisonValue}>{dashboardData.weeklyComparison.thisWeek}</Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Semana passada</Text>
                <Text style={styles.comparisonValue}>{dashboardData.weeklyComparison.lastWeek}</Text>
              </View>
              <View style={styles.growthIndicator}>
                <TrendingUp size={16} color="#10B981" />
                <Text style={styles.growthText}>+{dashboardData.weeklyComparison.growth}%</Text>
              </View>
            </View>
          </View>          {/* Top Services */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <Star size={20} color="#F59E0B" />
              <Text style={styles.dashboardTitle}>Serviços Mais Populares</Text>
            </View>
            <View style={styles.servicesContent}>
              {dashboardData.topServices.length > 0 ? (
                dashboardData.topServices.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceCount}>{service.count} agendamentos</Text>
                    </View>
                    <Text style={styles.serviceRevenue}>R$ {service.revenue}</Text>
                  </View>
                ))              ) : (
                <Text style={styles.legendText}>Nenhum serviço realizado ainda</Text>
              )}
            </View>
          </View>          {/* Client Retention */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <PieChart size={20} color="#8B5CF6" />
              <Text style={styles.dashboardTitle}>Retenção de Clientes</Text>
            </View>
            <View style={styles.retentionContent}>
              {stats.totalClients > 0 ? (
                <>
                  <View style={styles.retentionChart}>
                    <View style={[styles.retentionSegment, { backgroundColor: '#8B5CF6', width: `${dashboardData.clientRetention.returning}%` }]} />
                    <View style={[styles.retentionSegment, { backgroundColor: '#E5E7EB', width: `${dashboardData.clientRetention.new}%` }]} />
                  </View>
                  <View style={styles.retentionLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                      <Text style={styles.legendText}>Recorrentes ({dashboardData.clientRetention.returning}%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                      <Text style={styles.legendText}>Novos ({dashboardData.clientRetention.new}%)</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.legendText}>Nenhum cliente cadastrado ainda</Text>
              )}
            </View>
          </View>          {/* Busy Hours */}
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <Activity size={20} color="#EF4444" />
              <Text style={styles.dashboardTitle}>Horários de Pico</Text>
            </View>
            <View style={styles.busyHoursContent}>
              {dashboardData.busyHours.length > 0 ? (
                dashboardData.busyHours.map((slot, index) => (
                  <View key={index} style={styles.busyHourItem}>
                    <Text style={styles.busyHourTime}>{slot.hour}</Text>
                    <View style={styles.busyHourBar}>
                      <View 
                        style={[
                          styles.busyHourFill, 
                          { width: `${Math.min((slot.appointments / Math.max(...dashboardData.busyHours.map(h => h.appointments))) * 100, 100)}%` }
                        ]} 
                      />                    </View>
                    <Text style={styles.busyHourCount}>{slot.appointments}</Text>                  </View>
                ))
              ) : (
                <Text style={styles.legendText}>Nenhum agendamento realizado ainda</Text>
              )}
            </View>
          </View>
        </View>
        </>
        )}
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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  activitySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginTop: 4,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  // Additional Dashboard Styles
  dashboardsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  comparisonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  growthText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  servicesContent: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  serviceCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  serviceRevenue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  retentionContent: {
    gap: 16,
  },
  retentionChart: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  retentionSegment: {
    height: '100%',
  },
  retentionLegend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  busyHoursContent: {
    gap: 12,
  },
  busyHourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busyHourTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    width: 50,
  },
  busyHourBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  busyHourFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },  busyHourCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    width: 20,
    textAlign: 'right',
  },
  
  // Novos estilos para ícones das ações
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Estilos para atividade recente
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});
