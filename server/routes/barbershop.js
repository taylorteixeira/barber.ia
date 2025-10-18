const express = require("express");
const Barbershop = require("../models/Barbershop");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const barbershops = await Barbershop.find({});
    res.status(200).json(barbershops);
  } catch (err) {
    console.error("Erro ao buscar barbearias:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.post("/", async (req, res) => {
  const { name, cnpj, email, phone, address } = req.body;
  try {
    if (!name || !cnpj || !email || !phone || !address) {
      return res
        .status(400)
        .json({ message: "Preencha todos os campos obrigatórios." });
    }

    const barbershopExists = await Barbershop.findOne({ email });
    if (barbershopExists) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const barbershop = await Barbershop.create({
      name,
      cnpj,
      email,
      phone,
      address,
    });
    return res
      .status(201)
      .json({ message: "Barbearia registrada com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
