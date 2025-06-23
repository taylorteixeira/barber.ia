import {
  View,
  Text,
  StyleSheet,
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
  User,
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
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from '@/services/database';

export default function BarberProfile() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [barberData, setBarberData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    barbershopName: '',
    workingHours: '',
    services: [],
    priceRange: '',
  });

  useEffect(() => {
    axios.get('http://localhost:5000/barber/me')
      .then((res: any) => setBarberData(res.data))
      .catch(() => setBarberData({
        id: '', name: '', email: '', phone: '', address: '', avatar: '', barbershopName: '', workingHours: '', services: [], priceRange: ''
      }));
  }, []);

  // Função para selecionar imagem da galeria e atualizar avatar
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const avatarUrl = await uploadAvatar(uri, 'barber', barberData.id || 'me');
      if (avatarUrl) {
        setBarberData((prev) => ({ ...prev, avatar: avatarUrl }));
        await axios.put(`http://localhost:5000/barber/${barberData.id || 'me'}`, { avatar: avatarUrl });
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            router.replace('/landing');
          },
        },
      ]
    );
  };
  const menuSections = [
    {
      title: 'Perfil Profissional',
      items: [        {
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
        },        {
          id: 'pricing',
          title: 'Tabela de Preços',
          icon: DollarSign,
          color: '#10B981',
          onPress: () => router.push('/(barbertabs)/pricing' as any),
        },        {
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
      items: [        {
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickAvatar}>
            <Image source={{ uri: barberData.avatar }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{String(barberData.name ?? '')}</Text>
            <Text style={styles.barbershopName}>{String(barberData.barbershopName ?? '')}</Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={14} color="#6B7280" />
                <Text style={styles.contactText}>{String(barberData.email ?? '')}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={14} color="#6B7280" />
                <Text style={styles.contactText}>{String(barberData.phone ?? '')}</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.contactText}>{String(barberData.address ?? '')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
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

        {/* Services */}
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

        {/* Notifications */}
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

        {/* Menu Sections */}
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
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  barbershopName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginBottom: 16,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceChip: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  serviceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  notificationSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
});
