import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useState } from 'react';
import { Search, Phone, Mail, Star, Plus } from 'lucide-react-native';
import { styles } from './clients-styles';

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Clientes</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente por nome, telefone ou email"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
                Última visita:
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
