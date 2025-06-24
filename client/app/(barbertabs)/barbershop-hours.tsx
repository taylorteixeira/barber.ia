import {
  View,
  Text,
  StyleSheet,
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
import {
  ArrowLeft,
  Save,
  Clock,
  Edit,
} from 'lucide-react-native';
import {
  getCurrentUser,
  getBarbershopByOwnerId,
  updateBarbershop,
  createBarbershop,
  getDefaultWorkingHours,
  User,
  Barbershop,
  WorkingHours,
  DaySchedule,
} from '../../services/database';

export default function BarbershopHours() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(getDefaultWorkingHours());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<string>('');
  const [currentDaySchedule, setCurrentDaySchedule] = useState<DaySchedule | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);

        // Buscar barbearia do usuário
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            Configure os horários de funcionamento da sua barbearia. Estes serão os horários base para todos os barbeiros.
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

      {/* Modal de Edição de Horário */}
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

// Componente para editar horário do dia
function DayScheduleEditor({ 
  schedule, 
  onSave, 
  onCancel 
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
          onValueChange={(value) => setLocalSchedule({...localSchedule, isOpen: value})}
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
                onChangeText={(text) => setLocalSchedule({...localSchedule, openTime: text})}
                placeholder="09:00"
              />
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Fechamento</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.closeTime}
                onChangeText={(text) => setLocalSchedule({...localSchedule, closeTime: text})}
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
                onChangeText={(text) => setLocalSchedule({...localSchedule, breakStart: text})}
                placeholder="12:00"
              />
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Fim do Almoço</Text>
              <TextInput
                style={styles.timeInput}
                value={localSchedule.breakEnd || ''}
                onChangeText={(text) => setLocalSchedule({...localSchedule, breakEnd: text})}
                placeholder="13:00"
              />
            </View>
          </View>
        </>
      )}

      <View style={styles.modalActions}>
        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleSave}>
          <Text style={styles.confirmButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  dayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  dayInfo: {
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  breakText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  closedText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textAlign: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
