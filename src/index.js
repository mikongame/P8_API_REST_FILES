import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';
import authRoutes from './api/routes/auth.routes.js';
import eventRoutes from './api/routes/events.routes.js';
import taskRoutes from './api/routes/tasks.routes.js';

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('Falta la variable MONGO_URI en el .env');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

connectDB();

app.use(cors());
app.use(express.json());

import { globalErrorHandler, AppError } from './api/middlewares/error.middleware.js';

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API Eventify en funcionamiento');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// Middleware Global de Errores
app.use(globalErrorHandler);

io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado');

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado');
  });

  socket.on('new-task', (data) => {
    io.emit('task-added', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
