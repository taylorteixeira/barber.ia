import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Clock, Users, Plus, Edit } from 'lucide-react-native';
import {
  getCurrentUser,
  getBarbershopByOwnerId,
  updateBarbershop,
  createBarbershop,
  getDefaultWorkingHours,
  getBarbersByBarbershopId,
  createBarberProfile,
  updateUser,
  updateBarberProfile,
  getUserById,
  registerUser,
  updateBarberWorkingHours,
  User,
  Barbershop,
  WorkingHours,
  DaySchedule,
  BarberProfile,
} from '../../services/database';
import { styles } from './edit-profile-styles';

export default function EditProfile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    getDefaultWorkingHours()
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<string>('');
  const [newBarberModalVisible, setNewBarberModalVisible] = useState(false);
  const [editBarberModalVisible, setEditBarberModalVisible] = useState(false);
  const [barberWorkingHoursModalVisible, setBarberWorkingHoursModalVisible] =
    useState(false);
  const [editingBarberWorkingHours, setEditingBarberWorkingHours] =
    useState<Partial<WorkingHours> | null>(null);
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [barbersDetails, setBarbersDetails] = useState<{ [key: number]: User }>(
    {}
  );
  const [editingBarber, setEditingBarber] = useState<BarberProfile | null>(
    null
  );
  const [newBarberData, setNewBarberData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    barbershopName: '',
    barbershopDescription: '',
    barbershopAddress: '',
    barbershopPhone: '',
    barbershopEmail: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFormData((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }));

        const shop = await getBarbershopByOwnerId(user.id!);
        if (shop) {
          setBarbershop(shop);
          setWorkingHours(shop.workingHours);
          setFormData((prev) => ({
            ...prev,
            barbershopName: shop.name,
            barbershopDescription: shop.description || '',
            barbershopAddress: shop.address,
            barbershopPhone: shop.phone,
            barbershopEmail: shop.email,
          }));
          const shopBarbers = await getBarbersByBarbershopId(shop.id);
          setBarbers(shopBarbers);

          const barbersDetailsMap: { [key: number]: User } = {};
          for (const barber of shopBarbers) {
            const userDetails = await getUserById(barber.userId);
            if (userDetails) {
              barbersDetailsMap[barber.userId] = userDetails;
            }
          }
          setBarbersDetails(barbersDetailsMap);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };
  const handleSave = async () => {
    try {
      if (!currentUser) return;

      const userData: User = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      const userUpdateSuccess = await updateUser(userData);
      if (!userUpdateSuccess) {
        Alert.alert('Erro', 'Não foi possível atualizar seus dados pessoais.');
        return;
      }

      const barbershopData = {
        name: formData.barbershopName,
        description: formData.barbershopDescription,
        address: formData.barbershopAddress,
        phone: formData.barbershopPhone,
        email: formData.barbershopEmail,
        workingHours,
        ownerId: currentUser.id!,
        services: barbershop?.services || [],
      };

      let success = false;
      if (barbershop) {
        success = await updateBarbershop({ ...barbershop, ...barbershopData });
      } else {
        const newBarbershop = await createBarbershop(barbershopData);
        success = !!newBarbershop;
        if (newBarbershop) {
          setBarbershop(newBarbershop);
        }
      }

      if (success) {
        await loadData();
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível salvar as alterações da barbearia.'
        );
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar.');
    }
  };

  const openDayEditor = (day: string) => {
    setEditingDay(day);
    setModalVisible(true);
  };

  const updateDaySchedule = (schedule: DaySchedule) => {
    setWorkingHours((prev) => ({
      ...prev,
      [editingDay]: schedule,
    }));
    setModalVisible(false);
  };
  const handleAddBarber = async () => {
    try {
      if (!barbershop || !newBarberData.name || !newBarberData.email) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }

      const newUser: User = {
        name: newBarberData.name,
        email: newBarberData.email,
        phone: newBarberData.phone,
        password: 'barbeiro123',
        userType: 'barber',
        barbershopId: barbershop.id,
      };

      const userCreated = await registerUser(newUser);
      if (!userCreated) {
        Alert.alert(
          'Erro',
          'Não foi possível criar o usuário barbeiro. Verifique se o e-mail não está em uso.'
        );
        return;
      }

      const userId = Date.now();

      const newProfile: Omit<BarberProfile, 'id' | 'joinedAt'> = {
        userId: userId,
        barbershopId: barbershop.id,
        specialties: newBarberData.specialties
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        workingDays: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ],
        isActive: true,
      };

      const createdProfile = await createBarberProfile(newProfile);
      if (createdProfile) {
        await loadData();
        setNewBarberModalVisible(false);
        setNewBarberData({ name: '', email: '', phone: '', specialties: '' });
        Alert.alert(
          'Sucesso',
          `Barbeiro ${newBarberData.name} adicionado com sucesso!\n\nE-mail: ${newBarberData.email}\nSenha padrão: barbeiro123\n\nO barbeiro deve alterar a senha no primeiro acesso.`
        );
      }
    } catch (error) {
      console.error('Erro ao adicionar barbeiro:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o barbeiro.');
    }
  };

  const handleEditBarber = (barber: BarberProfile) => {
    const userDetails = barbersDetails[barber.userId];
    if (userDetails) {
      setEditingBarber(barber);
      setNewBarberData({
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        specialties: barber.specialties.join(', '),
      });
      setEditBarberModalVisible(true);
    }
  };

  const handleEditBarberWorkingHours = (barber: BarberProfile) => {
    setEditingBarber(barber);
    setEditingBarberWorkingHours(barber.customWorkingHours || {});
    setBarberWorkingHoursModalVisible(true);
  };

  const handleUpdateBarber = async () => {
    try {
      if (!editingBarber || !newBarberData.name || !newBarberData.email) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }

      const userDetails = barbersDetails[editingBarber.userId];
      if (userDetails) {
        const updatedUser: User = {
          ...userDetails,
          name: newBarberData.name,
          email: newBarberData.email,
          phone: newBarberData.phone,
        };

        const userUpdateSuccess = await updateUser(updatedUser);
        if (!userUpdateSuccess) {
          Alert.alert(
            'Erro',
            'Não foi possível atualizar os dados do barbeiro.'
          );
          return;
        }
      }

      const updatedProfile: BarberProfile = {
        ...editingBarber,
        specialties: newBarberData.specialties
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      };

      const profileUpdateSuccess = await updateBarberProfile(updatedProfile);
      if (profileUpdateSuccess) {
        await loadData();
        setEditBarberModalVisible(false);
        setEditingBarber(null);
        setNewBarberData({ name: '', email: '', phone: '', specialties: '' });
        Alert.alert('Sucesso', 'Barbeiro atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil do barbeiro.');
      }
    } catch (error) {
      console.error('Erro ao atualizar barbeiro:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o barbeiro.');
    }
  };

  const handleSaveBarberWorkingHours = async () => {
    try {
      if (!editingBarber || !editingBarberWorkingHours) return;

      const result = await updateBarberWorkingHours(
        editingBarber.userId,
        editingBarberWorkingHours
      );

      if (result.success) {
        Alert.alert('Sucesso', 'Horários do barbeiro atualizados com sucesso!');
        setBarberWorkingHoursModalVisible(false);
        setEditingBarber(null);
        setEditingBarberWorkingHours(null);
        loadData();
      } else {
        Alert.alert(
          'Erro',
          result.errors?.join('\n') || 'Erro ao atualizar horários'
        );
      }
    } catch (error) {
      console.error('Error saving barber working hours:', error);
      Alert.alert('Erro', 'Erro interno ao salvar horários');
    }
  };

  const handleToggleBarberStatus = async (barber: BarberProfile) => {
    try {
      const updatedProfile: BarberProfile = {
        ...barber,
        isActive: !barber.isActive,
      };

      const success = await updateBarberProfile(updatedProfile);
      if (success) {
        await loadData();
        Alert.alert(
          'Sucesso',
          `Barbeiro ${barber.isActive ? 'desativado' : 'ativado'} com sucesso!`
        );
      } else {
        Alert.alert('Erro', 'Não foi possível alterar o status do barbeiro.');
      }
    } catch (error) {
      console.error('Erro ao alterar status do barbeiro:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do barbeiro.');
    }
  };

  const getDayName = (day: string) => {
    const names: { [key: string]: string } = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };
    return names[day] || day;
  };

  const currentDaySchedule = editingDay
    ? workingHours[editingDay as keyof WorkingHours]
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Seu nome completo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="seu@email.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="(11) 99999-9999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Barbearia</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome da Barbearia</Text>
              <TextInput
                style={styles.input}
                value={formData.barbershopName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, barbershopName: text }))
                }
                placeholder="Nome da sua barbearia"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.barbershopDescription}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    barbershopDescription: text,
                  }))
                }
                placeholder="Descrição da barbearia..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={formData.barbershopAddress}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, barbershopAddress: text }))
                }
                placeholder="Endereço completo"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.barbershopPhone}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, barbershopPhone: text }))
                  }
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={formData.barbershopEmail}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, barbershopEmail: text }))
                  }
                  placeholder="contato@barbearia.com"
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário do Barbeiro</Text>
          <View style={styles.card}>
            {Object.entries(workingHours).map(([day, schedule]) => (
              <TouchableOpacity
                key={day}
                style={styles.dayRow}
                onPress={() => openDayEditor(day)}
              >
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{getDayName(day)}</Text>
                  <Text style={styles.daySchedule}>
                    {schedule.isOpen
                      ? `${schedule.openTime} - ${schedule.closeTime}${
                          schedule.breakStart
                            ? ` (Pausa: ${schedule.breakStart}-${schedule.breakEnd})`
                            : ''
                        }`
                      : 'Fechado'}
                  </Text>
                </View>
                <Edit size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Barbeiros da Equipe</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setNewBarberModalVisible(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {barbers.length > 0 ? (
              barbers.map((barber, index) => {
                const userDetails = barbersDetails[barber.userId];
                return (
                  <View key={barber.id} style={styles.barberRow}>
                    <View style={styles.barberInfo}>
                      <View style={styles.barberHeader}>
                        <Text style={styles.barberName}>
                          {userDetails?.name || `Barbeiro #${barber.userId}`}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: barber.isActive
                                ? '#DCFCE7'
                                : '#FEE2E2',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color: barber.isActive ? '#059669' : '#DC2626',
                              },
                            ]}
                          >
                            {barber.isActive ? 'Ativo' : 'Inativo'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.barberEmail}>
                        {userDetails?.email || 'E-mail não disponível'}
                      </Text>
                      <Text style={styles.barberSpecialties}>
                        {barber.specialties.length > 0
                          ? barber.specialties.join(', ')
                          : 'Nenhuma especialidade'}
                      </Text>
                      <Text style={styles.barberDays}>
                        Trabalha:
                        {barber.workingDays
                          .map((day) => getDayName(day))
                          .join(', ')}
                      </Text>
                    </View>
                    <View style={styles.barberActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditBarber(barber)}
                      >
                        <Edit size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditBarberWorkingHours(barber)}
                      >
                        <Clock size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          {
                            backgroundColor: barber.isActive
                              ? '#FEE2E2'
                              : '#DCFCE7',
                          },
                        ]}
                        onPress={() => handleToggleBarberStatus(barber)}
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: barber.isActive ? '#DC2626' : '#059669' },
                          ]}
                        >
                          {barber.isActive ? 'Desativar' : 'Ativar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Users size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>Nenhum barbeiro adicionado</Text>
                <Text style={styles.emptySubtext}>
                  Adicione barbeiros à sua equipe para que os clientes possam
                  escolher
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Horário - {getDayName(editingDay)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {currentDaySchedule && (
              <DayScheduleEditor
                schedule={currentDaySchedule}
                onSave={updateDaySchedule}
                onCancel={() => setModalVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={newBarberModalVisible}
        onRequestClose={() => setNewBarberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Barbeiro</Text>
              <TouchableOpacity onPress={() => setNewBarberModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.name}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Nome do barbeiro"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.email}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.phone}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, phone: text }))
                  }
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Especialidades (separadas por vírgula)
                </Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.specialties}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, specialties: text }))
                  }
                  placeholder="Corte, Barba, Sobrancelha"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewBarberModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddBarber}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editBarberModalVisible}
        onRequestClose={() => setEditBarberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Barbeiro</Text>
              <TouchableOpacity
                onPress={() => setEditBarberModalVisible(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.name}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Nome do barbeiro"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.email}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.phone}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, phone: text }))
                  }
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Especialidades (separadas por vírgula)
                </Text>
                <TextInput
                  style={styles.input}
                  value={newBarberData.specialties}
                  onChangeText={(text) =>
                    setNewBarberData((prev) => ({ ...prev, specialties: text }))
                  }
                  placeholder="Corte, Barba, Sobrancelha"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditBarberModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateBarber}
              >
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={barberWorkingHoursModalVisible}
        onRequestClose={() => setBarberWorkingHoursModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Horário -
                {editingBarber
                  ? barbersDetails[editingBarber.userId]?.name || 'Barbeiro'
                  : 'Barbeiro'}
              </Text>
              <TouchableOpacity
                onPress={() => setBarberWorkingHoursModalVisible(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionSubtitle}>
                Configure horários específicos para este barbeiro. Se não
                configurado, utilizará o horário da barbearia.
              </Text>

              {editingBarberWorkingHours &&
                [
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ].map((day) => {
                  const dayKey = day as keyof WorkingHours;
                  const schedule = editingBarberWorkingHours[dayKey];
                  const barbershopSchedule = barbershop?.workingHours[dayKey];

                  return (
                    <View key={day} style={styles.dayContainer}>
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>{getDayName(day)}</Text>
                        <Switch
                          value={schedule?.isOpen || false}
                          onValueChange={(value) => {
                            setEditingBarberWorkingHours((prev) => ({
                              ...prev,
                              [dayKey]: {
                                ...schedule,
                                isOpen: value,
                                openTime: value
                                  ? schedule?.openTime ||
                                    barbershopSchedule?.openTime ||
                                    '09:00'
                                  : '09:00',
                                closeTime: value
                                  ? schedule?.closeTime ||
                                    barbershopSchedule?.closeTime ||
                                    '18:00'
                                  : '18:00',
                              },
                            }));
                          }}
                        />
                      </View>

                      {schedule?.isOpen && (
                        <>
                          <View style={styles.timeRow}>
                            <View style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>Abertura</Text>
                              <TextInput
                                style={styles.timeInput}
                                value={schedule.openTime || '09:00'}
                                onChangeText={(text) => {
                                  setEditingBarberWorkingHours((prev) => ({
                                    ...prev,
                                    [dayKey]: { ...schedule, openTime: text },
                                  }));
                                }}
                                placeholder="09:00"
                              />
                            </View>
                            <View style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>Fechamento</Text>
                              <TextInput
                                style={styles.timeInput}
                                value={schedule.closeTime || '18:00'}
                                onChangeText={(text) => {
                                  setEditingBarberWorkingHours((prev) => ({
                                    ...prev,
                                    [dayKey]: { ...schedule, closeTime: text },
                                  }));
                                }}
                                placeholder="18:00"
                              />
                            </View>
                          </View>

                          <View style={styles.timeRow}>
                            <View style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>
                                Início do Almoço
                              </Text>
                              <TextInput
                                style={styles.timeInput}
                                value={schedule.breakStart || ''}
                                onChangeText={(text) => {
                                  setEditingBarberWorkingHours((prev) => ({
                                    ...prev,
                                    [dayKey]: { ...schedule, breakStart: text },
                                  }));
                                }}
                                placeholder="12:00"
                              />
                            </View>
                            <View style={styles.timeGroup}>
                              <Text style={styles.timeLabel}>
                                Fim do Almoço
                              </Text>
                              <TextInput
                                style={styles.timeInput}
                                value={schedule.breakEnd || ''}
                                onChangeText={(text) => {
                                  setEditingBarberWorkingHours((prev) => ({
                                    ...prev,
                                    [dayKey]: { ...schedule, breakEnd: text },
                                  }));
                                }}
                                placeholder="13:00"
                              />
                            </View>
                          </View>

                          {barbershopSchedule && (
                            <Text style={styles.warningText}>
                              Barbearia:
                              {barbershopSchedule.isOpen
                                ? `${barbershopSchedule.openTime} - ${barbershopSchedule.closeTime}`
                                : 'Fechada'}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBarberWorkingHoursModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveBarberWorkingHours}
              >
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DayScheduleEditor({
  schedule,
  onSave,
  onCancel,
}: {
  schedule: DaySchedule;
  onSave: (schedule: DaySchedule) => void;
  onCancel: () => void;
}) {
  const [isOpen, setIsOpen] = useState(schedule.isOpen);
  const [openTime, setOpenTime] = useState(schedule.openTime);
  const [closeTime, setCloseTime] = useState(schedule.closeTime);
  const [hasBreak, setHasBreak] = useState(!!schedule.breakStart);
  const [breakStart, setBreakStart] = useState(schedule.breakStart || '12:00');
  const [breakEnd, setBreakEnd] = useState(schedule.breakEnd || '13:00');

  const handleSave = () => {
    const newSchedule: DaySchedule = {
      isOpen,
      openTime: isOpen ? openTime : '09:00',
      closeTime: isOpen ? closeTime : '18:00',
      ...(hasBreak && isOpen ? { breakStart, breakEnd } : {}),
    };
    onSave(newSchedule);
  };

  return (
    <View style={styles.modalBody}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Aberto neste dia</Text>
        <Switch
          value={isOpen}
          onValueChange={setIsOpen}
          trackColor={{ false: '#E5E7EB', true: '#059669' }}
          thumbColor={isOpen ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>

      {isOpen && (
        <>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Abertura</Text>
              <TextInput
                style={styles.input}
                value={openTime}
                onChangeText={setOpenTime}
                placeholder="09:00"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Fechamento</Text>
              <TextInput
                style={styles.input}
                value={closeTime}
                onChangeText={setCloseTime}
                placeholder="18:00"
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Pausa para almoço</Text>
            <Switch
              value={hasBreak}
              onValueChange={setHasBreak}
              trackColor={{ false: '#E5E7EB', true: '#059669' }}
              thumbColor={hasBreak ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {hasBreak && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Início da Pausa</Text>
                <TextInput
                  style={styles.input}
                  value={breakStart}
                  onChangeText={setBreakStart}
                  placeholder="12:00"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Fim da Pausa</Text>
                <TextInput
                  style={styles.input}
                  value={breakEnd}
                  onChangeText={setBreakEnd}
                  placeholder="13:00"
                />
              </View>
            </View>
          )}
        </>
      )}

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.confirmButton]}
          onPress={handleSave}
        >
          <Text style={styles.confirmButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
