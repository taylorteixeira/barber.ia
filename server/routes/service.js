const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

// Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar serviços.' });
  }
});

// Criar serviço
router.post('/', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar serviço.' });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar serviço.' });
  }
});

// Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Serviço removido.' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao deletar serviço.' });
  }
});

module.exports = router;
