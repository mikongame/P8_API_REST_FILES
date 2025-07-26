import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("Falta la variable MONGO_URI en el .env");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => {
    console.error("Error de conexión a MongoDB:", err);
    process.exit(1);
  });

import planRoutes from "./routes/plans.js";
import taskRoutes from "./routes/tasks.js";

app.use("/plans", planRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("API Planify Files en funcionamiento");
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado");
  });

  socket.on("new-task", (data) => {
    console.log("Nueva tarea recibida por socket:", data);
    io.emit("task-added", data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});



