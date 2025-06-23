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
import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Star, Plus } from 'lucide-react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from '@/services/database';

// Definição do tipo para cliente
interface ClientType {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
  avatar: string;
  rating: number;
  preferredService: string;
}

export default function BarberClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    preferredService: '',
  });

  useEffect(() => {
    axios.get('http://localhost:5000/client')
      .then((res) => setClients(res.data))
      .catch(() => setClients([]));
  }, []);

  // Função para selecionar imagem da galeria (para usar na criação/edição)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      let clientId = editingClient?.id;
      // Se estiver criando novo cliente, o upload será feito após o cadastro
      if (clientId) {
        const avatarUrl = await uploadAvatar(uri, 'client', clientId);
        if (avatarUrl) {
          setClientForm((prev) => ({ ...prev, avatar: avatarUrl }));
          await axios.put(`http://localhost:5000/client/${clientId}`, { ...clientForm, avatar: avatarUrl });
        }
      } else {
        // Para novo cliente, apenas atualiza o form localmente
        setClientForm((prev) => ({ ...prev, avatar: uri }));
      }
    }
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    setClientForm({ name: '', email: '', phone: '', avatar: '', preferredService: '' });
    setModalVisible(true);
  };

  const openEditClientModal = (client: ClientType) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      avatar: client.avatar,
      preferredService: client.preferredService || '',
    });
    setModalVisible(true);
  };

  const handleSaveClient = async () => {
    try {
      if (!clientForm.name || !clientForm.email || !clientForm.phone) {
        alert('Preencha nome, e-mail e telefone');
        return;
      }
      if (editingClient) {
        // Editar cliente
        await axios.put(`http://localhost:5000/client/${editingClient.id}`, clientForm);
      } else {
        // Novo cliente
        await axios.post('http://localhost:5000/client', clientForm);
      }
      setModalVisible(false);
      setClientForm({ name: '', email: '', phone: '', avatar: '', preferredService: '' });
      setEditingClient(null);
      // Atualizar lista
      const res = await axios.get('http://localhost:5000/client');
      setClients(res.data);
    } catch (e) {
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (client: ClientType) => {
    openEditClientModal(client);
  };

  const handleDeleteClient = async (client: ClientType) => {
    try {
      await axios.delete(`http://localhost:5000/client/${client.id}`);
      setModalVisible(false);
      setEditingClient(null);
      // Atualizar lista
      const res = await axios.get('http://localhost:5000/client');
      setClients(res.data);
    } catch (e) {
      alert('Erro ao excluir cliente');
    }
  };

  // Proteção extra para garantir que todos os campos existem e são strings
  const safeString = (value: any) => typeof value === 'string' ? value : '';
  const safeNumber = (value: any) => typeof value === 'number' && !isNaN(value) ? value : 0;

  // Busca protegida
  const filteredClients = clients.filter(client => {
    const name = safeString(client.name).toLowerCase();
    const phone = safeString(client.phone);
    const email = safeString(client.email).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query) || email.includes(query);
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < rating ? "#F59E0B" : "#E5E7EB"}
        fill={i < rating ? "#F59E0B" : "transparent"}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={openNewClientModal}>
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
            {clients.filter(c => {
              const lastVisitStr = safeString(c.lastVisit);
              if (!lastVisitStr) return false;
              const lastVisitDate = new Date(lastVisitStr);
              if (isNaN(lastVisitDate.getTime())) return false;
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return lastVisitDate >= oneWeekAgo;
            }).length}
          </Text>
          <Text style={styles.statLabel}>Esta Semana</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {clients.length > 0 ? (
              (clients.reduce((sum, c) => sum + safeNumber(c.rating), 0) / clients.length).toFixed(1)
            ) : '0.0'}
          </Text>
          <Text style={styles.statLabel}>Avaliação Média</Text>
        </View>
      </View>

      {/* Clients List */}
      <ScrollView style={styles.clientsList} showsVerticalScrollIndicator={false}>
        {filteredClients.map((client, idx) => (
          <TouchableOpacity key={client.id || idx} style={styles.clientCard} onPress={() => handleEdit(client)}>
            <Image source={{ uri: safeString(client.avatar) || 'https://ui-avatars.com/api/?name=Cliente' }} style={styles.clientAvatar} />
            <View style={styles.clientInfo}>
              <View style={styles.clientHeader}>
                <Text style={styles.clientName}>{safeString(client.name)}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(safeNumber(client.rating))}
                </View>
              </View>
              
              <Text style={styles.clientPhone}>{safeString(client.phone)}</Text>
              <Text style={styles.clientEmail}>{safeString(client.email)}</Text>
              
              <View style={styles.clientStats}>
                <Text style={styles.preferredService}>Preferência: {safeString(client.preferredService)}</Text>
                <Text style={styles.visitCount}>{safeNumber(client.totalVisits)} visitas</Text>
              </View>
              
              <Text style={styles.lastVisit}>Última visita: {String(new Date(client.lastVisit).toLocaleDateString('pt-BR'))}</Text>
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

      {/* Modal de cadastro/edição de cliente */}
      {modalVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</Text>
            <TextInput style={styles.input} placeholder="Nome" value={clientForm.name} onChangeText={t => setClientForm(f => ({ ...f, name: t }))} />
            <TextInput style={styles.input} placeholder="E-mail" value={clientForm.email} onChangeText={t => setClientForm(f => ({ ...f, email: t }))} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Telefone" value={clientForm.phone} onChangeText={t => setClientForm(f => ({ ...f, phone: t }))} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Serviço preferido" value={clientForm.preferredService} onChangeText={t => setClientForm(f => ({ ...f, preferredService: t }))} />
            
            <TouchableOpacity onPress={pickImage} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Image source={{ uri: clientForm.avatar || 'https://ui-avatars.com/api/?name=Cliente' }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#1F2937' }}>{clientForm.avatar ? 'Alterar Imagem' : 'Selecionar Imagem'}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              {editingClient && (
                <TouchableOpacity onPress={() => handleDeleteClient(editingClient)} style={{ marginRight: 16 }}>
                  <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>Excluir</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 16 }}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveClient}><Text style={{ color: '#059669', fontWeight: 'bold' }}>{editingClient ? 'Salvar' : 'Adicionar'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  input: {
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
});
