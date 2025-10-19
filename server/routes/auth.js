const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, phone, email, password, isBarber } = req.body;
  try {
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const user = await User.create({ name, phone, email, password, isBarber });
    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (err) {
    return res.status(500).json({ message: "Erro no servidor." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro no servidor." });
  }
});

module.exports = router;
