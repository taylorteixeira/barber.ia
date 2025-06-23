const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

// Listar todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
  }
});

// Criar agendamento
router.post('/', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar agendamento.' });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar agendamento.' });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agendamento removido.' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao deletar agendamento.' });
  }
});

module.exports = router;
