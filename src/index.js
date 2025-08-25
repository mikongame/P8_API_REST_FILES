import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';
import planRoutes from './api/routes/plans.routes.js';
import taskRoutes from './api/routes/tasks.routes.js';

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error('❌ Falta la variable MONGO_URI en el .env');
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

app.use('/plans', planRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API Planify Files en funcionamiento');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

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
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
