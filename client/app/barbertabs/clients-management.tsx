import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
} from 'lucide-react-native';
import {
  createClient,
  updateClient,
  deleteClient,
  Client,
  getClientsFromBookings,
} from '@/services/database';
import { styles } from './clients-managements-styles';

export default function ClientsManagementScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  useEffect(() => {
    let isMounted = true;

    const loadClientsData = async () => {
      try {
        if (!isMounted) return;
        const data = await getClientsFromBookings();
        if (isMounted) {
          setClients(data);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        if (isMounted) {
          Alert.alert('Erro', 'Não foi possível carregar os clientes');
        }
      }
    };

    loadClientsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClientsFromBookings();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setClientForm({ name: '', phone: '', email: '' });
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
    });
    setShowModal(true);
  };
  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.phone) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      if (editingClient) {
        const updatedClient: Client = {
          ...editingClient,
          name: clientForm.name,
          phone: clientForm.phone,
          email: clientForm.email,
        };
        await updateClient(updatedClient);
      } else {
        await createClient({
          name: clientForm.name,
          phone: clientForm.phone,
          email: clientForm.email,
          isTemporary: false,
        });
      }

      await loadClients();
      setShowModal(false);
      setClientForm({ name: '', phone: '', email: '' });
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Erro', 'Não foi possível salvar o cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${client.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(client.id);
              await loadClients();
            } catch (error) {
              console.error('Error deleting client:', error);
              Alert.alert('Erro', 'Não foi possível excluir o cliente');
            }
          },
        },
      ]
    );
  };

  const handleScheduleAppointment = (client: Client) => {
    router.push(
      `/(barbertabs)/new-appointment?clientId=${client.id}&clientName=${client.name}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.clientsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? 'Nenhum cliente encontrado'
                : 'Nenhum cliente cadastrado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Tente buscar por outro nome ou telefone'
                : 'Adicione seus primeiros clientes para começar'}
            </Text>
          </View>
        ) : (
          filteredClients.map((client) => (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <View style={styles.clientAvatar}>
                  <User size={24} color="#6B7280" />
                </View>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <View style={styles.clientContact}>
                    <Phone size={14} color="#6B7280" />
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </View>
                  {client.email && (
                    <View style={styles.clientContact}>
                      <Mail size={14} color="#6B7280" />
                      <Text style={styles.clientEmail}>{client.email}</Text>
                    </View>
                  )}
                  {client.isTemporary && (
                    <View style={styles.temporaryBadge}>
                      <Text style={styles.temporaryText}>Temporário</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.clientActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleScheduleAppointment(client)}
                >
                  <Calendar size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditClient(client)}
                >
                  <Edit size={18} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteClient(client)}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <User size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  value={clientForm.name}
                  onChangeText={(text) =>
                    setClientForm({ ...clientForm, name: text })
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone"
                  value={clientForm.phone}
                  onChangeText={(text) =>
                    setClientForm({ ...clientForm, phone: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail (opcional)"
                  value={clientForm.email}
                  onChangeText={(text) =>
                    setClientForm({ ...clientForm, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  loading && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveClient}
                disabled={loading}
              >
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
