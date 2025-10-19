import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Settings as SettingsIcon,
  Bell,
  DollarSign,
  Clock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react-native';
import { getCurrentUser, logoutUser } from '@/services/database';
import { styles } from './profile-styles';

export default function BarberProfile() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [barberData, setBarberData] = useState({
    name: 'Carregando...',
    email: 'carregando@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - Centro',
    avatar:
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    barbershopName: 'Barbearia Premium',
    workingHours: '09:00 - 18:00',
    services: ['Corte', 'Barba', 'Sobrancelha'],
    priceRange: 'R$ 25 - R$ 50',
  });

  useEffect(() => {
    const loadBarberData = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setBarberData({
          ...barberData,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '(11) 99999-9999',
        });
      }
    };
    loadBarberData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/landing');
        },
      },
    ]);
  };
  const menuSections = [
    {
      title: 'Perfil Profissional',
      items: [
        {
          id: 'edit-profile',
          title: 'Editar Perfil',
          icon: Edit,
          color: '#3B82F6',
          onPress: () => router.push('/(barbertabs)/edit-profile' as any),
        },
        {
          id: 'services',
          title: 'Meus Serviços',
          icon: SettingsIcon,
          color: '#8B5CF6',
          onPress: () => router.push('/(barbertabs)/services' as any),
        },
        {
          id: 'products',
          title: 'Meus Produtos',
          icon: MapPin,
          color: '#F59E0B',
          onPress: () => router.push('/(barbertabs)/products' as any),
        },
        {
          id: 'pricing',
          title: 'Tabela de Preços',
          icon: DollarSign,
          color: '#10B981',
          onPress: () => router.push('/(barbertabs)/pricing' as any),
        },
        {
          id: 'schedule',
          title: 'Horário da Barbearia',
          icon: Clock,
          color: '#F59E0B',
          onPress: () => router.push('/(barbertabs)/barbershop-hours' as any),
        },
      ],
    },
    {
      title: 'Configurações',
      items: [
        {
          id: 'help',
          title: 'Ajuda e Suporte',
          icon: HelpCircle,
          color: '#06B6D4',
          onPress: () => router.push('/(barbertabs)/support' as any),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: barberData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{barberData.name}</Text>
            <Text style={styles.barbershopName}>
              {barberData.barbershopName}
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={14} color="#6B7280" />
                <Text style={styles.contactText}>{barberData.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={14} color="#6B7280" />
                <Text style={styles.contactText}>{barberData.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.contactText}>{barberData.address}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{barberData.workingHours}</Text>
            <Text style={styles.statLabel}>Horário</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{barberData.services.length}</Text>
            <Text style={styles.statLabel}>Serviços</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{barberData.priceRange}</Text>
            <Text style={styles.statLabel}>Preços</Text>
          </View>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Meus Serviços</Text>
          <View style={styles.servicesContainer}>
            {barberData.services.map((service, index) => (
              <View key={index} style={styles.serviceChip}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notificationSection}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationInfo}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.notificationTitle}>Notificações</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#059669' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.notificationDescription}>
            Receba notificações sobre novos agendamentos e lembretes
          </Text>
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}20` },
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
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
