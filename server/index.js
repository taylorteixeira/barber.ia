require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const barbershopRoutes = require('./routes/barbershop');
const barberRoutes = require('./routes/barber');
const clientRoutes = require('./routes/client');
const serviceRoutes = require('./routes/service');
const bookingRoutes = require('./routes/booking');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/barbershops', barbershopRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB conectado');
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));
})
.catch((err) => {
  console.error('Erro ao conectar ao MongoDB:', err);
});
