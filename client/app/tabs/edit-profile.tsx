import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react-native';
import {
  getCurrentUser,
  updateUser,
  setCurrentUser,
  checkEmailExistsForUpdate,
} from '@/services/database';
import { styles } from './edit-profile-styles';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUserState] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserState(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          confirmPassword: '',
        });
      } else {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        router.replace('/landing');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  };
  const validateForm = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erro', 'E-mail é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return false;
    }

    if (currentUser && formData.email !== currentUser.email) {
      const emailExists = await checkEmailExistsForUpdate(
        formData.email,
        currentUser.id
      );
      if (emailExists) {
        Alert.alert(
          'Erro',
          'Este e-mail já está sendo usado por outro usuário'
        );
        return false;
      }
    }

    if (!formData.phone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório');
      return false;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Erro', 'Senhas não conferem');
        return false;
      }
    }

    return true;
  };
  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setSaving(true);

      const updatedUser = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      if (formData.password) {
        updatedUser.password = formData.password;
      }

      const success = await updateUser(updatedUser);

      if (success) {
        const sessionUser = {
          ...updatedUser,
        };
        delete sessionUser.password;

        await setCurrentUser(sessionUser);
        Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              router.replace('/(tabs)/profile');
            },
          },
        ]);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível atualizar o perfil. Tente novamente.'
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <Save size={24} color="#4285F4" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alterar Senha</Text>
          <Text style={styles.sectionSubtitle}>
            Deixe em branco se não quiser alterar a senha
          </Text>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButtonLarge,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            🔒 Seus dados são mantidos em segurança e apenas você pode
            editá-los.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
