# Guia de Resolução de Problemas - Barber.ia

## Problemas Identificados e Correções Aplicadas:

### 1. **URLs Inconsistentes**
- ❌ **Problema**: URLs diferentes no auth.ts (localhost) e register.tsx (IP específico)
- ✅ **Solução**: Criado arquivo `config.ts` centralizado com todas as URLs da API

### 2. **Rotas Incorretas**
- ❌ **Problema**: Cliente chamando `/auth/register` mas servidor espera `/api/auth/register`
- ✅ **Solução**: Atualizado cliente para usar rotas corretas com `/api/`

### 3. **Script de Start Incorreto**
- ❌ **Problema**: package.json tentando executar `server.js` mas arquivo é `index.js`
- ✅ **Solução**: Corrigido scripts no package.json

### 4. **Falta de Logs e Debugging**
- ❌ **Problema**: Difícil identificar onde ocorrem os erros
- ✅ **Solução**: Adicionado logs detalhados no servidor

### 5. **CORS Restritivo**
- ❌ **Problema**: CORS pode estar bloqueando requisições do mobile
- ✅ **Solução**: Configurado CORS mais permissivo para desenvolvimento

## Como Testar:

### 1. **Testar Conexão com Banco**
```bash
cd server
node test-connection.js
```

### 2. **Iniciar Servidor**
```bash
cd server
npm run dev
```

### 3. **Verificar IP da Máquina**
- Abra o terminal e execute: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Anote o IP da sua rede local (ex: 192.168.1.X)
- Atualize o arquivo `client/services/config.ts` com seu IP:
```typescript
NETWORK_URL: 'http://SEU_IP_AQUI:5000',
```

### 4. **Testar no Mobile**
- Certifique-se que o celular está na mesma rede Wi-Fi do computador
- Execute o app no dispositivo físico (não no emulador para teste de rede)

## URLs de Teste:

### No Navegador (teste rápido):
- `http://SEU_IP:5000/api/auth/users` - Deve retornar lista de usuários

### No App Mobile:
- Tente fazer cadastro de um novo usuário
- Verifique os logs no terminal do servidor

## Logs Importantes:

O servidor agora mostra logs detalhados:
- 📡 Requisições recebidas
- 📝 Tentativas de registro
- ✅ Sucessos
- ❌ Erros detalhados

## Se Ainda Houver Problemas:

1. **Verificar Firewall**: O Windows Firewall pode estar bloqueando a porta 5000
2. **Verificar Antivírus**: Alguns antivírus bloqueiam conexões locais
3. **Testar com Postman**: Fazer requisição manual para `http://SEU_IP:5000/api/auth/users`
4. **Verificar Rede**: Certificar que dispositivos estão na mesma rede
