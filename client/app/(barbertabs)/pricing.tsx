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
  DollarSign,
  Clock,
  ArrowLeft,
  Save,
  X,
  Percent,
  Tag,
} from 'lucide-react-native';

interface PriceRule {
  id: string;
  name: string;
  description: string;
  type: 'fixed' | 'percentage';
  value: number;
  minValue?: number;
  validFrom?: string;
  validTo?: string;
  daysOfWeek?: string[];
  isActive: boolean;
}

export default function PricingManagement() {
  const router = useRouter();
  const [priceRules, setPriceRules] = useState<PriceRule[]>([
    {
      id: '1',
      name: 'Desconto Cliente Fiel',
      description: 'Desconto para clientes com mais de 10 visitas',
      type: 'percentage',
      value: 10,
      isActive: true,
    },
    {
      id: '2',
      name: 'Happy Hour',
      description: 'Desconto para horários de menor movimento',
      type: 'percentage',
      value: 15,
      daysOfWeek: ['Segunda', 'Terça'],
      isActive: true,
    },
    {
      id: '3',
      name: 'Taxa Adicional Feriado',
      description: 'Taxa extra para atendimentos em feriados',
      type: 'fixed',
      value: 10,
      isActive: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'fixed' | 'percentage',
    value: '',
    minValue: '',
    validFrom: '',
    validTo: '',
    daysOfWeek: [] as string[],
    isActive: true,
  });

  const daysOfWeek = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo',
  ];

  const filteredRules = priceRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minValue: '',
      validFrom: '',
      validTo: '',
      daysOfWeek: [],
      isActive: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (rule: PriceRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      value: rule.value.toString(),
      minValue: rule.minValue?.toString() || '',
      validFrom: rule.validFrom || '',
      validTo: rule.validTo || '',
      daysOfWeek: rule.daysOfWeek || [],
      isActive: rule.isActive,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.value) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const ruleData: PriceRule = {
      id: editingRule?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      value: parseFloat(formData.value),
      minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
      validFrom: formData.validFrom || undefined,
      validTo: formData.validTo || undefined,
      daysOfWeek:
        formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
      isActive: formData.isActive,
    };

    if (editingRule) {
      setPriceRules(
        priceRules.map((r) => (r.id === editingRule.id ? ruleData : r))
      );
    } else {
      setPriceRules([...priceRules, ruleData]);
    }

    setModalVisible(false);
    Alert.alert(
      'Sucesso',
      editingRule ? 'Regra atualizada!' : 'Regra adicionada!'
    );
  };

  const handleDelete = (rule: PriceRule) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a regra "${rule.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setPriceRules(priceRules.filter((r) => r.id !== rule.id));
            Alert.alert('Sucesso', 'Regra excluída!');
          },
        },
      ]
    );
  };

  const toggleRuleStatus = (rule: PriceRule) => {
    setPriceRules(
      priceRules.map((r) =>
        r.id === rule.id ? { ...r, isActive: !r.isActive } : r
      )
    );
  };

  const toggleDaySelection = (day: string) => {
    const newDays = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter((d) => d !== day)
      : [...formData.daysOfWeek, day];

    setFormData({ ...formData, daysOfWeek: newDays });
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
        <Text style={styles.headerTitle}>Regras de Preço</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar regras..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.rulesList} showsVerticalScrollIndicator={false}>
        {filteredRules.map((rule) => (
          <View key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleInfo}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleName}>{rule.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleRuleStatus(rule)}
                  style={[
                    styles.statusBadge,
                    rule.isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      rule.isActive
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}
                  >
                    {rule.isActive ? 'Ativa' : 'Inativa'}
                  </Text>
                </TouchableOpacity>
              </View>

              {rule.description ? (
                <Text style={styles.ruleDescription}>{rule.description}</Text>
              ) : null}

              <View style={styles.ruleDetails}>
                <View style={styles.detailItem}>
                  {rule.type === 'percentage' ? (
                    <Percent size={16} color="#10B981" />
                  ) : (
                    <DollarSign size={16} color="#10B981" />
                  )}
                  <Text style={styles.valueText}>
                    {rule.type === 'percentage'
                      ? `${rule.value}%`
                      : `R$ ${rule.value.toFixed(2)}`}
                  </Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                      {rule.type === 'percentage' ? 'Desconto' : 'Valor Fixo'}
                    </Text>
                  </View>
                </View>
              </View>

              {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                <View style={styles.daysContainer}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.daysText}>
                    {rule.daysOfWeek.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.ruleActions}>
              <TouchableOpacity
                onPress={() => openEditModal(rule)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Edit size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(rule)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredRules.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhuma regra encontrada</Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Criar Primeira Regra</Text>
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
              {editingRule ? 'Editar Regra' : 'Nova Regra'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome da Regra *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ex: Desconto Cliente Fiel"
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
                placeholder="Descrição da regra..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Regra</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({ ...formData, type: 'percentage' })
                  }
                  style={[
                    styles.typeOption,
                    formData.type === 'percentage' && styles.typeOptionSelected,
                  ]}
                >
                  <Percent
                    size={16}
                    color={
                      formData.type === 'percentage' ? '#FFFFFF' : '#6B7280'
                    }
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'percentage' &&
                        styles.typeOptionTextSelected,
                    ]}
                  >
                    Percentual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, type: 'fixed' })}
                  style={[
                    styles.typeOption,
                    formData.type === 'fixed' && styles.typeOptionSelected,
                  ]}
                >
                  <DollarSign
                    size={16}
                    color={formData.type === 'fixed' ? '#FFFFFF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === 'fixed' &&
                        styles.typeOptionTextSelected,
                    ]}
                  >
                    Valor Fixo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  {formData.type === 'percentage'
                    ? 'Percentual (%)'
                    : 'Valor (R$)'}
                  *
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, value: text })
                  }
                  placeholder={formData.type === 'percentage' ? '10' : '10.00'}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Valor Mínimo (R$)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minValue}
                  onChangeText={(text) =>
                    setFormData({ ...formData, minValue: text })
                  }
                  placeholder="50.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dias da Semana (opcional)</Text>
              <Text style={styles.subLabel}>
                Selecione os dias em que a regra se aplica
              </Text>
              <View style={styles.daysSelector}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDaySelection(day)}
                    style={[
                      styles.dayOption,
                      formData.daysOfWeek.includes(day) &&
                        styles.dayOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        formData.daysOfWeek.includes(day) &&
                          styles.dayOptionTextSelected,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Regra Ativa</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  style={[
                    styles.switch,
                    formData.isActive && styles.switchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.isActive && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
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
  rulesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ruleCard: {
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
  ruleInfo: {
    flex: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusInactive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextInactive: {
    color: '#EF4444',
  },
  ruleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  ruleDetails: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  typeBadge: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  daysText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  ruleActions: {
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
  subLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeOptionSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayOptionSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  dayOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#059669',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
});
