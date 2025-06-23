const express = require('express');
const Client = require('../models/Client');
const router = express.Router();

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar clientes.' });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar cliente.' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar cliente.' });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cliente removido.' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao deletar cliente.' });
  }
});

module.exports = router;
