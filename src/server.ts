import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { SyncOptions } from 'sequelize';
import { PORT_DEFAULT } from './config/config';
import { sequelize } from './models';
import authRoutes from './routes/authRoutes';
import checkinRoutes from './routes/checkinRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes';
import productRoutes from './routes/productRoutes';
import storeRoutes from './routes/storeRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import setupSwagger from './swagger';
const app = express();
const PORT = PORT_DEFAULT || 3000;

const corsOptions = {
  origin: [
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:8100',
    '*',
  ], // Substitua pelo domínio do seu frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Content-Type',
    'application/json',
    'X-Requested-With',
    'XMLHttpRequest',
  ],
};

// Middleware para lidar com JSON com limite aumentado
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

app.use(cors());
// Configurar arquivos estáticos fotos checkins/checkouts e uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Roteamento
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', healthCheckRoutes);
const optionsSyncSequelize: SyncOptions = {
  alter: false, // update das tabelas sem deletar
  force: false, // deletar tudo e recriar
  benchmark: false,
};
// Configurar Swagger
setupSwagger(app);

// Conectar ao banco de dados e iniciar o servidor
// sequelize.sync({ alter: true }); //
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync(optionsSyncSequelize);
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default app;
