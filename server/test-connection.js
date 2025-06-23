// Script para testar a conexão e funcionalidades básicas
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Teste de criação de usuário
    console.log('🔄 Testando criação de usuário...');
    const testUser = {
      name: 'Teste',
      phone: 11999999999,
      email: 'teste@example.com',
      password: '123456',
      isBarber: false
    };
    
    // Remove usuário de teste se existir
    await User.deleteOne({ email: testUser.email });
    
    const user = await User.create(testUser);
    console.log('✅ Usuário de teste criado:', user._id);
    
    // Remove usuário de teste
    await User.deleteOne({ _id: user._id });
    console.log('✅ Usuário de teste removido');
    
    await mongoose.disconnect();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testConnection();
