# Barber.ia

Este projeto é um aplicativo de agendamento de serviços de barbearia, desenvolvido em React Native com Expo Router. Ele utiliza armazenamento local seguro para cadastro, login e gerenciamento de usuários.

## Estrutura do Projeto

```
barber.ia/
├── app.json                # Configuração do Expo
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── expo-env.d.ts           # Tipos do Expo
├── LICENSE                 # Licença
├── assets/                 # Imagens e recursos estáticos
│   └── images/
├── hooks/                  # Custom hooks
│   └── useFrameworkReady.ts
├── services/               # Serviços de dados e autenticação
│   └── database.ts         # Lógica de cadastro, login e sessão
├── app/                    # Código principal do app
│   ├── _layout.tsx         # Layout global
│   ├── index.tsx           # Tela inicial (redirecionamento)
│   ├── +not-found.tsx      # Tela de erro 404
│   ├── (auth)/             # Fluxo de autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx       # Tela de login
│   │   └── register.tsx    # Tela de cadastro
│   └── (tabs)/             # Fluxo principal do app
│       ├── _layout.tsx
│       ├── index.tsx       # Home (lista de barbearias)
│       ├── bookings.tsx    # Agendamentos
│       ├── profile.tsx     # Perfil do usuário
│       └── search.tsx      # Busca
```

## Como funciona

Instalar: npm install
Iniciar: epx expo start --offline

- **Cadastro:**
  - O usuário informa nome, e-mail, telefone e senha.
  - A senha é criptografada com bcryptjs e os dados são salvos localmente usando o SecureStore.
  - Não é possível cadastrar dois usuários com o mesmo e-mail.

- **Login:**
  - O usuário informa e-mail e senha.
  - O app busca o usuário cadastrado e compara a senha informada (criptografada) com a salva.
  - Se válido, armazena a sessão do usuário no SecureStore.

- **Sessão:**
  - O app verifica se há usuário logado ao iniciar.
  - O usuário pode sair da conta pelo menu de perfil.

- **Navegação:**
  - O fluxo de autenticação e o fluxo principal são separados por pastas (auth) e (tabs), usando Expo Router.

## Estrutura do banco de dados (SecureStore)

- **Usuários:**
  - Armazenados como um array de objetos no SecureStore, chave `barber_users`.
  - Cada usuário possui:
    - `id`: número sequencial
    - `name`: nome
    - `email`: e-mail (único)
    - `phone`: telefone
    - `password`: senha criptografada (bcryptjs)

- **Sessão:**
  - Usuário logado salvo na chave `barber_current_user` (sem a senha).

- **Contador de usuários:**
  - Chave `barber_user_counter` para gerar novos IDs sequenciais.

## Tecnologias principais
- React Native (Expo)
- Expo Router
- TypeScript
- bcryptjs (com fallback para ambiente Expo)
- expo-secure-store

## Observações
- O app não utiliza backend: todo o cadastro, login e sessão são feitos localmente no dispositivo.
---
## Distribuição
- npx eas build -p android --profile preview --aab

Sinta-se à vontade para contribuir ou adaptar o projeto para suas necessidades!
