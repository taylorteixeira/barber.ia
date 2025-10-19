import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  DollarSign,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react-native';
import { styles } from './services-styles';

import {
  getServices,
  createService,
  updateService,
  deleteService,
  Service,
  getCurrentUser,
  getBarbershopByOwnerId,
  updateBarbershopServices,
} from '@/services/database';

export default function ServicesManagement() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
  });

  const categories = ['Corte', 'Barba', 'Estética', 'Combo', 'Outros'];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      const activeServices = data.filter((s) => s.isActive);
      setServices(activeServices);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    }
  };

  const syncWithBarbershop = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.userType === 'barber') {
        const barbershop = await getBarbershopByOwnerId(currentUser.id!);
        if (barbershop) {
          await updateBarbershopServices(barbershop.id, services);
          console.log(
            '✅ Services synced with barbershop - clients will see updates immediately'
          );
        }
      }
    } catch (error) {
      console.error('Error syncing with barbershop:', error);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'Corte',
    });
    setModalVisible(true);
  };
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
    });
    setModalVisible(true);
  };
  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        isActive: true,
      };

      if (editingService) {
        const updatedService = { ...editingService, ...serviceData };
        await updateService(updatedService);
        setServices(
          services.map((s) => (s.id === editingService.id ? updatedService : s))
        );
      } else {
        const newService = await createService(serviceData);
        setServices([...services, newService]);
      }

      await syncWithBarbershop();

      setModalVisible(false);
      Alert.alert(
        'Sucesso',
        editingService ? 'Serviço atualizado!' : 'Serviço adicionado!'
      );
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Erro', 'Não foi possível salvar o serviço');
    }
  };
  const handleDelete = async (service: Service) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o serviço "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service.id);
              setServices(services.filter((s) => s.id !== service.id));

              await syncWithBarbershop();

              Alert.alert('Sucesso', 'Serviço excluído!');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.servicesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{service.category}</Text>
                </View>
              </View>

              {service.description ? (
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              ) : null}

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <DollarSign size={16} color="#10B981" />
                  <Text style={styles.priceText}>
                    R$ {service.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.durationText}>
                    {service.duration} min
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.serviceActions}>
              <TouchableOpacity
                onPress={() => openEditModal(service)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Edit size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(service)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredServices.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>
                Adicionar Primeiro Serviço
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do Serviço *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ex: Corte Masculino"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Descrição do serviço..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Preço (R$) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Duração (min) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration}
                  onChangeText={(text) =>
                    setFormData({ ...formData, duration: text })
                  }
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData({ ...formData, category })}
                    style={[
                      styles.categoryOption,
                      formData.category === category &&
                        styles.categoryOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.category === category &&
                          styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
