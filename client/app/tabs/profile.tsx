import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Calendar,
  Star,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import {
  logoutUser,
  getCurrentUser,
  getBookings,
  Booking,
  initBookingsDatabase,
} from '@/services/database';
import { styles } from './profile-styles';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Carregando...',
    email: 'Carregando...',
    phone: 'Carregando...',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    totalBookings: 0,
    reviewsGiven: 0,
    avgRating: 0,
  });
  const router = useRouter();

  const loadUserData = async () => {
    await initBookingsDatabase();
    const userData = await getCurrentUser();
    if (userData) {
      const bookings: Booking[] = await getBookings();
      const userBookings = bookings.filter((b) => b.status !== 'cancelled');
      const total = userBookings.length;
      const completedBookings = userBookings.filter(
        (b) => b.status === 'completed'
      );
      const avgRating = completedBookings.length > 0 ? 4.5 : 0;
      setUser({
        ...user,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || 'Não informado',
        totalBookings: total,
        avgRating,
        reviewsGiven: completedBookings.length,
      });
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );
  const menuItems = [
    {
      id: 'bookings-history',
      title: 'Histórico de Agendamentos',
      icon: Calendar,
      color: '#10B981',
      onPress: () => router.push('/(tabs)/bookings'),
    },
    {
      id: 'my-reviews',
      title: 'Minhas Avaliações',
      icon: Star,
      color: '#F59E0B',
      onPress: () => {
        Alert.alert(
          'Minhas Avaliações',
          `Você avaliou ${user.reviewsGiven} serviços com uma média de ${user.avgRating} estrelas.`,
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'help',
      title: 'Ajuda e Suporte',
      icon: HelpCircle,
      color: '#06B6D4',
      onPress: () => {
        Alert.alert(
          'Ajuda e Suporte',
          'FAQ: Perguntas frequentes\nContato: (11) 99999-9999\nE-mail: suporte@barber.ia',
          [
            {
              text: 'FAQ',
              onPress: () =>
                Alert.alert(
                  'FAQ',
                  'Como agendar? Clique no barbeiro desejado e escolha "Agendar Horário".'
                ),
            },
            {
              text: 'Contato',
              onPress: () =>
                Alert.alert(
                  'Contato',
                  'Entre em contato pelo WhatsApp: (11) 99999-9999'
                ),
            },
            { text: 'Fechar', style: 'cancel' },
          ]
        );
      },
    },
  ];

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/(tabs)/edit-profile')}
          >
            <Edit size={16} color="#FFFFFF" />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalBookings}</Text>
            <Text style={styles.statLabel}>Agendamentos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.reviewsGiven}</Text>
            <Text style={styles.statLabel}>Avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statNumber}>{user.avgRating}</Text>
              <Star
                size={16}
                color="#F59E0B"
                fill="#F59E0B"
                style={styles.ratingIcon}
              />
            </View>
            <Text style={styles.statLabel}>Média</Text>
          </View>
        </View>
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <item.icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
