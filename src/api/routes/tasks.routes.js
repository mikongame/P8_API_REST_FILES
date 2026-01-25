import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', getAllTasks);
router.get('/:id', getTaskById);

// Rutas protegidas (requieren autenticación)
router.post('/', isAuth, upload.single('image'), createTask);
router.put('/:id', isAuth, upload.single('image'), updateTask);
router.delete('/:id', isAuth, deleteTask);

export default router;
