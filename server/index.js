require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const barbershopRoutes = require("./routes/barbershop");
const barberRoutes = require("./routes/barber");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/barbershops", barbershopRoutes);
app.use("/api/barbers", barberRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
  });
