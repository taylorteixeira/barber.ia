# Barber.ia 💈

Um aplicativo completo de agendamento de serviços de barbearia com funcionalidades profissionais, desenvolvido em React Native com Expo Router. Sistema integrado entre clientes e barbeiros com sincronização em tempo real.

## Estrutura do Projeto

```
barber.ia/
├── app.json                # Configuração do Expo
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── eas.json               # Configuração de build EAS
├── INTEGRATION_SUMMARY.md  # Resumo das integrações implementadas
├── LICENSE                 # Licença
├── assets/                # Imagens e recursos estáticos
│   └── images/
├── hooks/                 # Custom hooks
│   ├── useFrameworkReady.ts
│   └── useMotionDetection.ts  # Detecção de movimento facial
├── services/              # Serviços de dados e business logic
│   ├── database.ts        # Sistema completo de dados integrados
│   └── exportService.ts   # Serviços de exportação
├── app/                   # Código principal do app
│   ├── _layout.tsx        # Layout global
│   ├── index.tsx          # Tela inicial (redirecionamento)
│   ├── landing.tsx        # Página de apresentação
│   ├── booking.tsx        # Sistema de agendamento
│   ├── +not-found.tsx     # Tela de erro 404
│   ├── (auth)/            # Fluxo de autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx      # Login para clientes
│   │   ├── register.tsx   # Cadastro de clientes
│   │   ├── welcome.tsx    # Boas-vindas cliente
│   │   ├── barber-onboarding.tsx  # Onboarding barbeiro
│   │   └── barber-welcome.tsx     # Boas-vindas barbeiro
│   ├── (tabs)/            # Portal do Cliente
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Home (lista de barbearias)
│   │   ├── bookings.tsx   # Agendamentos do cliente
│   │   ├── profile.tsx    # Perfil do cliente
│   │   ├── edit-profile.tsx  # Edição de perfil
│   │   └── search.tsx     # Busca de barbeiros
│   ├── (barbertabs)/      # Portal do Barbeiro
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Dashboard do barbeiro
│   │   ├── agenda.tsx     # Agenda de agendamentos
│   │   ├── clients-management.tsx  # Gestão de clientes reais
│   │   ├── clients.tsx    # Lista de clientes
│   │   ├── edit-profile.tsx  # Edição perfil barbeiro
│   │   ├── new-appointment.tsx  # Novo agendamento manual
│   │   ├── pricing.tsx    # Gestão de preços
│   │   ├── products.tsx   # Gestão de produtos
│   │   ├── services.tsx   # Gestão de serviços
│   │   ├── barbershop-hours.tsx  # Horários funcionamento
│   │   └── support.tsx    # Suporte
│   ├── barber/            # Páginas dinâmicas barbeiro
│   │   └── [id].tsx       # Perfil específico do barbeiro
│   └── barbershop/        # Páginas dinâmicas barbearia
│       └── [id].tsx       # Perfil específico da barbearia
```

## 🚀 Como funciona

**Instalação:**
```bash
npm install
```

**Iniciar desenvolvimento:**
```bash
npx expo start --offline
```

### 👤 **Fluxo do Cliente:**

1. **Cadastro/Login:**
   - Cadastra-se com nome, e-mail, telefone e senha
   - Senha criptografada e dados salvos localmente
   - Login seguro com validação

2. **Busca e Agendamento:**
   - Visualiza lista de barbeiros disponíveis
   - Seleciona barbeiro específico
   - Vê serviços e preços em tempo real
   - Agenda serviço para o barbeiro escolhido

3. **Gestão de Agendamentos:**
   - Visualiza todos seus agendamentos
   - Pode cancelar ou marcar como concluído
   - Recebe notificações de mudanças do barbeiro

### ✂️ **Fluxo do Barbeiro:**

1. **Onboarding Profissional:**
   - Cadastro específico para barbeiros
   - Configuração de perfil e serviços

2. **Gestão da Agenda:**
   - Visualiza agendamentos de clientes reais
   - Confirma, cancela ou conclui serviços
   - Notificações automáticas para clientes

3. **Gestão do Negócio:**
   - Atualiza serviços e preços (aparecem imediatamente para clientes)
   - Gerencia horários de funcionamento
   - Lista de clientes que realmente agendaram
   - Gestão de produtos e suporte

### 🔄 **Sincronização Inteligente:**
- **Cliente agenda** → Aparece para barbeiro específico
- **Barbeiro cancela** → Cliente recebe notificação
- **Cliente conclui** → Barbeiro vê atualização
- **Barbeiro atualiza preço** → Cliente vê novo preço instantaneamente

## 🗄️ Estrutura do banco de dados

### **Usuários e Sessões:**
- **Clientes:** Array armazenado em `barber_users`
- **Barbeiros:** Array armazenado em `barber_barbers` 
- **Sessão atual:** `barber_current_user` (sem senha)
- **Contador de IDs:** `barber_user_counter` e `barber_barber_counter`

### **Sistema de Agendamentos:**
- **Bookings (Cliente):** `barber_bookings` - Agendamentos feitos pelos clientes
- **Appointments (Barbeiro):** `barber_appointments` - Agendamentos recebidos pelos barbeiros
- **Sincronização automática:** Status sincronizados bidirecionalmente

### **Dados de Negócio:**
- **Barbearias:** `barber_barbershops` - Informações, serviços e preços
- **Clientes por Barbeiro:** Extraídos automaticamente dos agendamentos
- **Serviços e Preços:** Atualizados em tempo real

### **Estrutura de Dados:**

**Usuário/Cliente:**
```typescript
{
  id: number,
  name: string,
  email: string, // único
  phone: string,
  password: string, // criptografada
  type: 'client'
}
```

**Barbeiro:**
```typescript
{
  id: string, // prefixo real_ ou mock_
  name: string,
  email: string,
  phone: string,
  password: string,
  type: 'barber',
  barbershopId: string,
  specialties: string[]
}
```

**Agendamento:**
```typescript
{
  id: string,
  clientId: number,
  barberId: string,
  barbershopId: string,
  service: string,
  date: string,
  time: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  price: number
}
```

## 🛠️ Tecnologias principais

### **Frontend:**
- React Native (Expo SDK 51+)
- Expo Router (navegação baseada em arquivos)
- TypeScript (tipagem estática)
- React Native Paper (componentes UI)
- Lucide React Native (ícones)

### **Desenvolvimento:**
- EAS Build (compilação e distribuição)
- Expo Development Build
- Hot Reload para desenvolvimento rápido

## 🎯 Principais Integrações Implementadas

### ✅ **Agendamentos Específicos por Barbeiro**
- Sistema de IDs únicos (`real_` e `mock_`) 
- Agendamentos direcionados corretamente
- Rastreamento preciso por `barbershopId`

### ✅ **Sincronização Bidirecional**
- Cliente cancela → Barbeiro é notificado
- Barbeiro confirma → Cliente é notificado  
- Status sincronizados em tempo real
- Função `updateBookingStatus()` integrada

### ✅ **Clientes Reais no Portal do Barbeiro**
- Lista apenas clientes que realmente agendaram
- Extração automática via `getClientsFromBookings()`
- Atualização automática a cada novo agendamento

### ✅ **Atualização em Tempo Real**
- Barbeiro atualiza preços → Cliente vê imediatamente
- Serviços sincronizados via `updateBarbershopServices()`
- Dados sempre atualizados com `refreshBarbershopData()`

## 📱 Como usar o aplicativo

### **Para Clientes:**
1. Faça seu cadastro na tela de registro
2. Navegue pela lista de barbeiros
3. Selecione um barbeiro específico  
4. Veja serviços e preços atualizados
5. Agende seu serviço
6. Acompanhe o status na aba "Agendamentos"

### **Para Barbeiros:**
1. Complete o onboarding de barbeiro
2. Configure seus serviços e preços
3. Gerencie agendamentos na agenda
4. Veja clientes reais na aba "Clientes"
5. Atualize informações (aparecem para clientes instantaneamente)
## 📦 Distribuição e Build

**Build para Android (AAB):**
```bash
npx eas build -p android --profile preview --aab
```

**Build para iOS:**
```bash
npx eas build -p ios --profile preview
```

**Desenvolvimento local:**
```bash
npx expo start --dev-client
```

## 🤝 Contribuição

Sinta-se à vontade para contribuir com o projeto

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

## 🎊 **RESULTADO FINAL**

**O Barber.ia é um aplicativo completo e profissional que oferece:**

✅ **Sistema integrado** entre clientes e barbeiros  
✅ **Agendamentos inteligentes** direcionados corretamente  
✅ **Sincronização em tempo real** de dados e status  
✅ **Experiência profissional** equivalente a apps comerciais  
✅ **Interface moderna** e intuitiva  
✅ **Código bem estruturado** e documentado  

## Apresentação
https://www.canva.com/design/DAGrTFfGOo4/jbLifiw2YqcRCngODNhIew/edit?utm_content=DAGrTFfGOo4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
