const express = require('express');
const Barber = require('../models/Barber');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find({});
    res.status(200).json(barbers);
  } catch (err) {
    console.error('Erro ao buscar barbearias:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

router.get('/:barbershopId', async (req, res) => {
    try {
        const { barbershopId } = req.params;
        const barbers = await Barber.find({ barbershop: barbershopId });
        if (!barbers) {
            return res.status(404).json({ message: 'Nenhum barbeiro encontrado para esta barbearia.' });
        }
        res.status(200).json(barbers);
    } catch (err) {
        console.error('Erro ao buscar barbeiros da barbearia:', err);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

router.post('/', async (req, res) => {
  const { name, cpf, email, password, phone, barbershop } = req.body;
  try {
    if (!name || !cpf || !email || !password || !phone || !barbershop) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const barberExists = await Barber.findOne({ email });
    if (barberExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const barber = await Barber.create({ name, cpf, email, password, phone, address });
    return res.status(201).json({ message: 'Barbeiro registrado com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

module.exports = router;