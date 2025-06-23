import {
  View,
  Text,
  StyleSheet,
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
import axios from 'axios';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  category: string;
}

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

  const filteredServices = services.filter(service =>
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
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const serviceData: Service = {
      id: editingService?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category,
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
    } else {
      setServices([...services, serviceData]);
    }

    setModalVisible(false);
    Alert.alert('Sucesso', editingService ? 'Serviço atualizado!' : 'Serviço adicionado!');
  };

  const handleDelete = (service: Service) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o serviço "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setServices(services.filter(s => s.id !== service.id));
            Alert.alert('Sucesso', 'Serviço excluído!');
          },
        },
      ]
    );
  };

  useEffect(() => {
    axios.get('http://localhost:5000/service')
      .then((res: any) => setServices(res.data))
      .catch(() => setServices([]));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Services List */}
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.serviceDescription}>{service.description}</Text>
              ) : null}
              
              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <DollarSign size={16} color="#10B981" />
                  <Text style={styles.priceText}>R$ {service.price.toFixed(2)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.durationText}>{service.duration} min</Text>
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
              <Text style={styles.emptyButtonText}>Adicionar Primeiro Serviço</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
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
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Ex: Corte Masculino"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
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
                  onChangeText={(text) => setFormData({...formData, price: text})}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Duração (min) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration}
                  onChangeText={(text) => setFormData({...formData, duration: text})}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData({...formData, category})}
                    style={[
                      styles.categoryOption,
                      formData.category === category && styles.categoryOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      formData.category === category && styles.categoryOptionTextSelected
                    ]}>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#EBF8FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
});
