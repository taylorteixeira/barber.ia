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
import { useState } from 'react';
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
} from 'lucide-react-native';
import { styles } from './pricing-styles';

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
