import express from 'express';
import upload from '../middlewares/upload.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js';

const router = express.Router();

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', upload.single('image'), createTask);
router.put('/:id', upload.single('image'), updateTask);
router.delete('/:id', deleteTask);

export default router;
