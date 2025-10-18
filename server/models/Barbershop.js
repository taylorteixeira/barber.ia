const mongoose = require("mongoose");

const BarbershopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "O nome da barbearia é obrigatório."],
    },

    cnpj: {
      type: Number,
      required: [true, "O CNPJ é obrigatório."],
      unique: true,
    },

    email: {
      type: String,
      required: [true, "O e-mail é obrigatório."],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Por favor, insira um e-mail válido."],
    },

    phone: {
      type: Number,
      required: [true, "O telefone é obrigatório."],
      unique: true,
    },

    address: {
      street: { type: String, required: true },
      number: { type: Number, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      cep: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Barbershop", BarbershopSchema);
