import {
  View,
  Text,
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
  Star,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Camera,
} from 'lucide-react-native';
import {
  getCurrentUser,
  getAppointmentsForCurrentBarber,
  getBookingsForCurrentBarbershop,
  getClientsFromBookings,
  getBarbershopByOwnerId,
} from '../../services/database';
import { styles } from './index-styles';
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
  });
  const [stats, setStats] = useState<DashboardStats>({
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
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        const userData = await getCurrentUser();
        if (userData && isMounted) {
          const barbershop = await getBarbershopByOwnerId(userData.id!);
          if (!isMounted) return;

          setBarberData({
            name: userData.name,
            barbershopName: barbershop ? barbershop.name : 'Minha Barbearia',
          });
          const appointments = await getAppointmentsForCurrentBarber();
          const bookings = await getBookingsForCurrentBarbershop();
          const clients = await getClientsFromBookings();

          if (!isMounted) return;

          setRecentAppointments(appointments);

          const today = new Date().toISOString().split('T')[0];
          const todayAppointments = appointments.filter(
            (apt) => apt.date === today
          ).length;

          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const weekBookings = bookings.filter(
            (booking) =>
              new Date(booking.date) >= oneWeekAgo &&
              booking.status === 'completed'
          );
          const weekRevenue = weekBookings.reduce(
            (sum, booking) => sum + booking.price,
            0
          );

          const pendingAppointments = appointments.filter(
            (apt) => apt.status === 'scheduled'
          ).length;

          const averageRating = bookings.length > 0 ? 4.5 : 0;

          const serviceStats = new Map<
            string,
            { count: number; revenue: number }
          >();
          bookings.forEach((booking) => {
            if (booking.status === 'completed') {
              const existing = serviceStats.get(booking.service) || {
                count: 0,
                revenue: 0,
              };
              serviceStats.set(booking.service, {
                count: existing.count + 1,
                revenue: existing.revenue + booking.price,
              });
            }
          });

          const topServices: TopService[] = Array.from(serviceStats.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
          const timeSlots = [
            { range: '08:00-11:00', start: 8, end: 11 },
            { range: '11:00-14:00', start: 11, end: 14 },
            { range: '14:00-17:00', start: 14, end: 17 },
            { range: '17:00-20:00', start: 17, end: 20 },
          ];

          const busyHours: BusyHour[] = timeSlots
            .map((slot) => {
              const count = appointments.filter((apt) => {
                const hour = parseInt(apt.time.split(':')[0]);
                return hour >= slot.start && hour < slot.end;
              }).length;

              return {
                hour: slot.range,
                appointments: count,
              };
            })
            .filter((slot) => slot.appointments > 0)
            .sort((a, b) => b.appointments - a.appointments);

          const clientBookingCounts = new Map<string, number>();
          bookings.forEach((booking) => {
            if (booking.clientName) {
              const count = clientBookingCounts.get(booking.clientName) || 0;
              clientBookingCounts.set(booking.clientName, count + 1);
            }
          });

          const returningClients = Array.from(
            clientBookingCounts.values()
          ).filter((count) => count > 1).length;
          const newClients = Array.from(clientBookingCounts.values()).filter(
            (count) => count === 1
          ).length;
          const totalUniqueClients = returningClients + newClients;

          const returningPercentage =
            totalUniqueClients > 0
              ? Math.round((returningClients / totalUniqueClients) * 100)
              : 0;
          const newPercentage =
            totalUniqueClients > 0
              ? Math.round((newClients / totalUniqueClients) * 100)
              : 0;

          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const lastWeekAppointments = appointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            return aptDate >= twoWeeksAgo && aptDate < oneWeekAgo;
          }).length;

          const thisWeekAppointments = appointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            return aptDate >= oneWeekAgo;
          }).length;
          const growth =
            lastWeekAppointments > 0
              ? Math.round(
                  ((thisWeekAppointments - lastWeekAppointments) /
                    lastWeekAppointments) *
                    100
                )
              : 0;

          if (!isMounted) return;

          setStats({
            todayAppointments,
            weekRevenue,
            totalClients: clients.length,
            averageRating,
            pendingAppointments,
            monthlyGrowth: growth,
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
            dailyRevenue: [0, 0, 0, 0, 0, 0, 0],
            busyHours,
          });

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const recentApts = appointments
            .filter((apt) => {
              const aptDate = new Date(apt.date + 'T' + apt.time);
              return aptDate >= yesterday;
            })
            .sort((a, b) => {
              const dateA = new Date(a.date + 'T' + a.time);
              const dateB = new Date(b.date + 'T' + b.time);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);
          setRecentAppointments(recentApts);
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

    return () => {
      isMounted = false;
    };
  }, []);
  const handleQuickAction = (action: string) => {
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
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening FaceCut:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar abrir o FaceCut. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
                <Text style={styles.statValue}>
                  {stats.averageRating > 0
                    ? stats.averageRating.toFixed(1)
                    : '0'}
                </Text>
                <Text style={styles.statLabel}>Avaliação</Text>
              </View>
            </View>
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Ações Rápidas</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('new-appointment')}
                >
                  <View
                    style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}
                  >
                    <Plus size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.actionText}>Novo Agendamento</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('view-agenda')}
                >
                  <View
                    style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}
                  >
                    <Calendar size={24} color="#10B981" />
                  </View>
                  <Text style={styles.actionText}>Ver Agenda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('manage-services')}
                >
                  <View
                    style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}
                  >
                    <Settings size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.actionText}>Gerenciar Serviços</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('facecut')}
                >
                  <View
                    style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}
                  >
                    <Camera size={24} color="#8B5CF6" />
                  </View>
                  <Text style={styles.actionText}>FaceCut</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleQuickAction('manage-clients')}
                >
                  <View
                    style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}
                  >
                    <Users size={24} color="#EF4444" />
                  </View>
                  <Text style={styles.actionText}>Clientes</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Atividade Recente</Text>
              <View style={styles.activityCard}>
                {recentAppointments.length === 0 ? (
                  <Text style={styles.legendText}>
                    Nenhuma atividade recente
                  </Text>
                ) : (
                  recentAppointments.map((booking, index) => {
                    const clientName = booking.notes?.includes('Cliente:')
                      ? booking.notes.split('Cliente: ')[1].split(' (')[0]
                      : 'Cliente';
                    const service = booking.notes?.includes('Serviço:')
                      ? booking.notes.split('Serviço: ')[1].split(' -')[0]
                      : 'Serviço';

                    const bookingTime = new Date(
                      booking.date + 'T' + booking.time
                    );
                    const now = new Date();
                    const diffMs = now.getTime() - bookingTime.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor(
                      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                    );

                    let timeAgo = '';
                    if (diffHours > 0) {
                      timeAgo = `Há ${diffHours} hora${
                        diffHours > 1 ? 's' : ''
                      }`;
                    } else if (diffMins > 0) {
                      timeAgo = `Há ${diffMins} minuto${
                        diffMins > 1 ? 's' : ''
                      }`;
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

                    return (
                      <View key={index} style={styles.activityItem}>
                        <View
                          style={[
                            styles.activityDot,
                            { backgroundColor: dotColor },
                          ]}
                        />
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>
                            {activityText}
                          </Text>
                          <Text style={styles.activityTime}>{timeAgo}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
            <View style={styles.dashboardsSection}>
              <Text style={styles.sectionTitle}>Análises Detalhadas</Text>
              <View style={styles.dashboardCard}>
                <View style={styles.dashboardHeader}>
                  <BarChart3 size={20} color="#3B82F6" />
                  <Text style={styles.dashboardTitle}>Comparativo Semanal</Text>
                </View>
                <View style={styles.comparisonContent}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Esta semana</Text>
                    <Text style={styles.comparisonValue}>
                      {dashboardData.weeklyComparison.thisWeek}
                    </Text>
                  </View>
                  <View style={styles.comparisonDivider} />
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Semana passada</Text>
                    <Text style={styles.comparisonValue}>
                      {dashboardData.weeklyComparison.lastWeek}
                    </Text>
                  </View>
                  <View style={styles.growthIndicator}>
                    <TrendingUp size={16} color="#10B981" />
                    <Text style={styles.growthText}>
                      +{dashboardData.weeklyComparison.growth}%
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.dashboardCard}>
                <View style={styles.dashboardHeader}>
                  <Star size={20} color="#F59E0B" />
                  <Text style={styles.dashboardTitle}>
                    Serviços Mais Populares
                  </Text>
                </View>
                <View style={styles.servicesContent}>
                  {dashboardData.topServices.length > 0 ? (
                    dashboardData.topServices.map((service, index) => (
                      <View key={index} style={styles.serviceItem}>
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.serviceCount}>
                            {service.count} agendamentos
                          </Text>
                        </View>
                        <Text style={styles.serviceRevenue}>
                          R$ {service.revenue}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.legendText}>
                      Nenhum serviço realizado ainda
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.dashboardCard}>
                <View style={styles.dashboardHeader}>
                  <PieChart size={20} color="#8B5CF6" />
                  <Text style={styles.dashboardTitle}>
                    Retenção de Clientes
                  </Text>
                </View>
                <View style={styles.retentionContent}>
                  {stats.totalClients > 0 ? (
                    <>
                      <View style={styles.retentionChart}>
                        <View
                          style={[
                            styles.retentionSegment,
                            {
                              backgroundColor: '#8B5CF6',
                              width: `${dashboardData.clientRetention.returning}%`,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.retentionSegment,
                            {
                              backgroundColor: '#E5E7EB',
                              width: `${dashboardData.clientRetention.new}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.retentionLegend}>
                        <View style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: '#8B5CF6' },
                            ]}
                          />
                          <Text style={styles.legendText}>
                            Recorrentes (
                            {dashboardData.clientRetention.returning}%)
                          </Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: '#E5E7EB' },
                            ]}
                          />
                          <Text style={styles.legendText}>
                            Novos ({dashboardData.clientRetention.new}%)
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.legendText}>
                      Nenhum cliente cadastrado ainda
                    </Text>
                  )}
                </View>
              </View>
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
                              {
                                width: `${Math.min(
                                  (slot.appointments /
                                    Math.max(
                                      ...dashboardData.busyHours.map(
                                        (h) => h.appointments
                                      )
                                    )) *
                                    100,
                                  100
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.busyHourCount}>
                          {slot.appointments}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.legendText}>
                      Nenhum agendamento realizado ainda
                    </Text>
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
