const express = require("express");
const Barbershop = require("../models/Barbershop");

const router = express.Router();

router.get("/", async (res) => {
  try {
    const barbershops = await Barbershop.find({});
    res.status(200).json(barbershops);
  } catch (err) {
    console.error("Erro ao buscar barbearias:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.get("/:barbershopId", async (req, res) => {
  try {
    const { barbershopId } = req.params;
    const barbershop = await Barbershop.findById(barbershopId);
    if (!barbershop) {
      return res.status(404).json({ message: "Barbearia não encontrada." });
    }
    res.status(200).json(barbershop);
  } catch (err) {
    console.error("Erro ao buscar barbearia:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router;
