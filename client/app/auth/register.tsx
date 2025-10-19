import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowLeft,
} from 'lucide-react-native';
import { registerAndLoginUser } from '@/services/database';
import { styles } from './register-styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const userType = (params.userType as 'client' | 'barber') || 'client';
  const handleGoBack = () => {
    router.push('/landing');
  };

  const handleRegister = async () => {
    if (userType === 'barber') {
      router.push('/(auth)/barber-onboarding');
      return;
    }
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);

    try {
      const loggedInUser = await registerAndLoginUser({
        name,
        email,
        phone,
        password,
        userType,
      });

      if (loggedInUser) {
        Alert.alert(
          'Bem-vindo!',
          'Conta criada com sucesso! Você já está logado.',
          [
            {
              text: 'Começar',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao criar sua conta. O email já pode estar em uso.'
        );
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao criar sua conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            Criar Conta {userType === 'barber' ? 'Barbeiro' : 'Cliente'}
          </Text>
          <Text style={styles.subtitle}>
            {userType === 'barber'
              ? 'Cadastre sua barbearia na plataforma'
              : 'Preencha os dados para começar'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Já tem uma conta?
            <Link href={`/(auth)/login?userType=${userType}`} asChild>
              <Text style={styles.footerLink}>Faça login</Text>
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
