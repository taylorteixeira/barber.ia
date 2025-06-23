const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Barbershop = require('../models/Barbershop');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { name, phone, email, password, isBarber } = req.body;
  console.log('📝 Tentativa de registro:', { name, phone, email, isBarber });
  
  try {
    if (!name || !phone || !email || !password) {
      console.log('❌ Campos obrigatórios não preenchidos');
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Email já cadastrado:', email);
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const user = await User.create({ name, phone, email, password, isBarber });
    console.log('✅ Usuário criado com sucesso:', user._id);
    return res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: user._id });
  } catch (err) {
    console.error('❌ Erro no registro:', err);
    return res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, isBarber: Boolean(user.isBarber) } });
  } catch (err) {
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Listar todos os usuários (clientes e barbeiros)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('barbershop').populate('barbershops');
    const formatted = await Promise.all(users.map(async user => {
      let barbershops = [];
      if (user.isBarber) {
        // Junta barbershop antigo e novo
        if (user.barbershop) barbershops.push(user.barbershop);
        if (user.barbershops && user.barbershops.length > 0) barbershops = barbershops.concat(user.barbershops);
      }
      // Busca serviços das barbearias
      let services = [];
      if (barbershops.length > 0) {
        const Service = require('../models/Service');
        const all = await Service.find({ barbershopId: { $in: barbershops.map(b => b._id) } });
        services = all.map(s => ({ id: s._id, name: s.name, price: s.price, duration: s.duration }));
      }
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isBarber: Boolean(user.isBarber),
        rating: user.rating,
        location: user.location,
        createdAt: user.createdAt,
        barbershops: barbershops.map(b => ({ id: b._id, name: b.name, address: b.address })),
        services
      };
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// Buscar usuário por ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('barbershop').populate('barbershops');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    let barbershops = [];
    if (user.isBarber) {
      if (user.barbershop) barbershops.push(user.barbershop);
      if (user.barbershops && user.barbershops.length > 0) barbershops = barbershops.concat(user.barbershops);
    }
    let services = [];
    if (barbershops.length > 0) {
      const Service = require('../models/Service');
      const all = await Service.find({ barbershopId: { $in: barbershops.map(b => b._id) } });
      services = all.map(s => ({ id: s._id, name: s.name, price: s.price, duration: s.duration }));
    }
    const formatted = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isBarber: Boolean(user.isBarber),
      rating: user.rating,
      location: user.location,
      createdAt: user.createdAt,
      barbershops: barbershops.map(b => ({ id: b._id, name: b.name, address: b.address })),
      services
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
});

// Rota para retornar dados do usuário autenticado
router.get('/me', async (req, res) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('barbershop').populate('barbershops');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    let barbershops = [];
    if (user.isBarber) {
      if (user.barbershop) barbershops.push(user.barbershop);
      if (user.barbershops && user.barbershops.length > 0) barbershops = barbershops.concat(user.barbershops);
    }
    let services = [];
    if (barbershops.length > 0) {
      const Service = require('../models/Service');
      const all = await Service.find({ barbershopId: { $in: barbershops.map(b => b._id) } });
      services = all.map(s => ({ id: s._id, name: s.name, price: s.price, duration: s.duration }));
    }
    // Retorna todos os dados relevantes do usuário
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isBarber: Boolean(user.isBarber),
      rating: user.rating,
      location: user.location,
      createdAt: user.createdAt,
      barbershops: barbershops.map(b => ({ id: b._id, name: b.name, address: b.address })),
      services
    });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
});

// Atualizar localização do usuário logado
router.put('/location', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Latitude e longitude obrigatórias.' });
    }
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { location: { lat, lng } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.json({ message: 'Localização atualizada com sucesso.', location: user.location });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
});

module.exports = router;
