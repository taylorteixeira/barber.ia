import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
import { styles } from './support-styles';

const predefinedResponses = [
  'Olá! Sou a IA do Barber.IA. Como posso ajudar você hoje?',
  'Entendo sua dúvida. Vou te ajudar com isso!',
  'Essa é uma ótima pergunta! Aqui está a informação que você precisa:',
  'Posso esclarecer isso para você. Vamos resolver juntos!',
  'Obrigado por entrar em contato. Estou aqui para ajudar!',
  'Você pode encontrar essa opção no menu principal do aplicativo.',
  'Para melhor atendimento, você também pode nos contatar pelo email suporte@barber.ia',
  'Ficou alguma dúvida? Estou aqui para ajudar!',
];

export default function SupportScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Bem-vindo ao suporte do Barber.IA! 👋\n\nSou sua assistente virtual e estou aqui para ajudar com suas dúvidas sobre o aplicativo. Como posso te ajudar hoje?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('agendamento') ||
      lowerMessage.includes('agendar')
    ) {
      return 'Para fazer agendamentos, você pode usar a aba "Agenda" do aplicativo. Lá você consegue ver horários disponíveis e criar novos agendamentos com facilidade!';
    }

    if (
      lowerMessage.includes('preço') ||
      lowerMessage.includes('valor') ||
      lowerMessage.includes('tabela')
    ) {
      return 'Você pode gerenciar os preços dos seus serviços na aba "Tabela de Preços" do menu principal. Lá é possível adicionar, editar e remover valores dos serviços oferecidos.';
    }

    if (
      lowerMessage.includes('horário') ||
      lowerMessage.includes('funcionamento')
    ) {
      return 'Os horários de funcionamento podem ser configurados no seu perfil, na opção "Horário da Barbearia". Você pode definir horários diferentes para cada dia da semana!';
    }

    if (lowerMessage.includes('perfil') || lowerMessage.includes('dados')) {
      return 'Para editar seu perfil, acesse a aba "Perfil" e toque em "Editar Perfil". Lá você pode atualizar suas informações pessoais e da barbearia.';
    }

    if (lowerMessage.includes('serviço') || lowerMessage.includes('produto')) {
      return 'Você pode gerenciar seus serviços e produtos nas respectivas abas do menu. É possível adicionar novos itens, editar descrições e definir durações.';
    }

    if (lowerMessage.includes('barbeiro') || lowerMessage.includes('equipe')) {
      return 'Para gerenciar sua equipe de barbeiros, acesse "Editar Perfil" e vá na seção "Equipe". Lá você pode adicionar novos barbeiros e configurar seus horários.';
    }

    if (
      lowerMessage.includes('obrigado') ||
      lowerMessage.includes('obrigada') ||
      lowerMessage.includes('valeu')
    ) {
      return 'Por nada! Fico feliz em ajudar! Se precisar de mais alguma coisa, estarei aqui. 😊';
    }

    if (
      lowerMessage.includes('oi') ||
      lowerMessage.includes('olá') ||
      lowerMessage.includes('bom dia') ||
      lowerMessage.includes('boa tarde') ||
      lowerMessage.includes('boa noite')
    ) {
      return 'Olá! Que bom te ver aqui! Como posso ajudar você hoje? Estou pronta para esclarecer qualquer dúvida sobre o Barber.IA!';
    }

    const randomIndex = Math.floor(Math.random() * predefinedResponses.length);
    return predefinedResponses[randomIndex];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
            <Text style={styles.headerSubtitle}>Assistente IA • Online</Text>
          </View>
          <View style={styles.botIcon}>
            <Bot size={24} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  {message.isUser ? (
                    <User
                      size={16}
                      color={message.isUser ? '#FFFFFF' : '#6366F1'}
                    />
                  ) : (
                    <Bot size={16} color="#6366F1" />
                  )}
                </View>
                <Text style={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={styles.messageIcon}>
                  <Bot size={16} color="#6366F1" />
                </View>
                <Text style={styles.messageTime}>agora</Text>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#6366F1" />
                  <Text
                    style={[
                      styles.messageText,
                      styles.aiText,
                      { marginLeft: 8 },
                    ]}
                  >
                    Digitando...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              editable={!isTyping}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
