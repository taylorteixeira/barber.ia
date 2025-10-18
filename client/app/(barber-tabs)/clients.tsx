import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useState } from 'react';
import { Search, Phone, Mail, Star, Plus } from 'lucide-react-native';

export default function BarberClients() {
  const [searchQuery, setSearchQuery] = useState('');

  const clients = [
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 99999-1111',
      email: 'joao@email.com',
      lastVisit: '2024-06-20',
      totalVisits: 15,
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      rating: 5,
      preferredService: 'Corte + Barba',
    },
    {
      id: '2',
      name: 'Pedro Santos',
      phone: '(11) 99999-2222',
      email: 'pedro@email.com',
      lastVisit: '2024-06-18',
      totalVisits: 8,
      avatar:
        'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg',
      rating: 4,
      preferredService: 'Corte',
    },
    {
      id: '3',
      name: 'Carlos Lima',
      phone: '(11) 99999-3333',
      email: 'carlos@email.com',
      lastVisit: '2024-06-15',
      totalVisits: 22,
      avatar:
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
      rating: 5,
      preferredService: 'Barba',
    },
    {
      id: '4',
      name: 'Ana Costa',
      phone: '(11) 99999-4444',
      email: 'ana@email.com',
      lastVisit: '2024-06-12',
      totalVisits: 5,
      avatar:
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      rating: 4,
      preferredService: 'Corte',
    },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < rating ? '#F59E0B' : '#E5E7EB'}
        fill={i < rating ? '#F59E0B' : 'transparent'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Clientes</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente por nome, telefone ou email"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clients.length}</Text>
          <Text style={styles.statLabel}>Total de Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              clients.filter((c) => {
                const lastVisit = new Date(c.lastVisit);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return lastVisit >= oneWeekAgo;
              }).length
            }
          </Text>
          <Text style={styles.statLabel}>Esta Semana</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {(
              clients.reduce((sum, c) => sum + c.rating, 0) / clients.length
            ).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Avaliação Média</Text>
        </View>
      </View>

      {/* Clients List */}
      <ScrollView
        style={styles.clientsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredClients.map((client) => (
          <TouchableOpacity key={client.id} style={styles.clientCard}>
            <Image
              source={{ uri: client.avatar }}
              style={styles.clientAvatar}
            />

            <View style={styles.clientInfo}>
              <View style={styles.clientHeader}>
                <Text style={styles.clientName}>{client.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(client.rating)}
                </View>
              </View>

              <Text style={styles.clientPhone}>{client.phone}</Text>
              <Text style={styles.clientEmail}>{client.email}</Text>

              <View style={styles.clientStats}>
                <Text style={styles.preferredService}>
                  Preferência: {client.preferredService}
                </Text>
                <Text style={styles.visitCount}>
                  {client.totalVisits} visitas
                </Text>
              </View>

              <Text style={styles.lastVisit}>
                Última visita:{' '}
                {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            <View style={styles.clientActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={16} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Mail size={16} color="#059669" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  statsContainer: {
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
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  clientsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  clientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  clientPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  preferredService: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  visitCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  lastVisit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  clientActions: {
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: '#F0FDF4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});
