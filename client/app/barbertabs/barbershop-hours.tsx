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
import { ArrowLeft, Save, Edit } from 'lucide-react-native';
import {
  getCurrentUser,
  getBarbershopByOwnerId,
  updateBarbershop,
  getDefaultWorkingHours,
  User,
  Barbershop,
  WorkingHours,
  DaySchedule,
} from '../../services/database';
import { styles } from './barbershop-hours-styes';

export default function BarbershopHours() {
  const router = useRouter();
  const [setCurrentUser] = useState<User | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    getDefaultWorkingHours()
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<string>('');
  const [currentDaySchedule, setCurrentDaySchedule] =
    useState<DaySchedule | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);

        const shop = await getBarbershopByOwnerId(user.id!);
        if (shop) {
          setBarbershop(shop);
          setWorkingHours(shop.workingHours);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    }
  };

  const getDayName = (day: string) => {
    const days = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };
    return days[day as keyof typeof days] || day;
  };

  const handleEditDay = (day: string) => {
    const dayKey = day as keyof WorkingHours;
    setEditingDay(day);
    setCurrentDaySchedule(workingHours[dayKey]);
    setModalVisible(true);
  };

  const updateDaySchedule = (updatedSchedule: DaySchedule) => {
    const dayKey = editingDay as keyof WorkingHours;
    const newWorkingHours = {
      ...workingHours,
      [dayKey]: updatedSchedule,
    };
    setWorkingHours(newWorkingHours);
    setModalVisible(false);
  };

  const handleSave = async () => {
    try {
      if (!barbershop) {
        Alert.alert('Erro', 'Barbearia não encontrada');
        return;
      }

      const updatedBarbershop = {
        ...barbershop,
        workingHours,
      };

      const success = await updateBarbershop(updatedBarbershop);

      if (success) {
        Alert.alert('Sucesso', 'Horários de funcionamento atualizados!');
        setBarbershop(updatedBarbershop);
      } else {
        Alert.alert('Erro', 'Erro ao salvar horários');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Erro interno ao salvar');
    }
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
        <Text style={styles.headerTitle}>Horário da Barbearia</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários de Funcionamento</Text>
          <Text style={styles.sectionSubtitle}>
            Configure os horários de funcionamento da sua barbearia. Estes serão
            os horários base para todos os barbeiros.
          </Text>

          {Object.entries(workingHours).map(([day, schedule]) => (
            <View key={day} style={styles.dayContainer}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{getDayName(day)}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditDay(day)}
                >
                  <Edit size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.dayInfo}>
                {schedule.isOpen ? (
                  <View>
                    <Text style={styles.timeText}>
                      {schedule.openTime} - {schedule.closeTime}
                    </Text>
                    {schedule.breakStart && schedule.breakEnd && (
                      <Text style={styles.breakText}>
                        Almoço: {schedule.breakStart} - {schedule.breakEnd}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.closedText}>Fechado</Text>
                )}
              </View>
            </View>
          ))}
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
  const [localSchedule, setLocalSchedule] = useState<DaySchedule>(schedule);

  const handleSave = () => {
    onSave(localSchedule);
  };

  return (
    <View style={styles.modalBody}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Aberto neste dia</Text>
        <Switch
          value={localSchedule.isOpen}
          onValueChange={(value) =>
            setLocalSchedule({ ...localSchedule, isOpen: value })
          }
          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
          thumbColor={localSchedule.isOpen ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>

      {localSchedule.isOpen && (
        <>
          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Abertura</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.openTime}
                onChangeText={(text) =>
                  setLocalSchedule({ ...localSchedule, openTime: text })
                }
                placeholder="09:00"
              />
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Fechamento</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.closeTime}
                onChangeText={(text) =>
                  setLocalSchedule({ ...localSchedule, closeTime: text })
                }
                placeholder="18:00"
              />
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Início do Almoço</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.breakStart || ''}
                onChangeText={(text) =>
                  setLocalSchedule({ ...localSchedule, breakStart: text })
                }
                placeholder="12:00"
              />
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Fim do Almoço</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.breakEnd || ''}
                onChangeText={(text) =>
                  setLocalSchedule({ ...localSchedule, breakEnd: text })
                }
                placeholder="13:00"
              />
            </View>
          </View>
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
