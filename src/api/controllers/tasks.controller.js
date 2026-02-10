import Task from '../models/Task.js';
import Event from '../models/Event.js';
import cloudinary from '../middlewares/cloudinary.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../middlewares/error.middleware.js';

export const getAllTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find().populate('event');
  res.status(200).json(tasks);
});

export const getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('event');
  if (!task) return next(new AppError('Tarea no encontrada', 404));
  res.status(200).json(task);
});

export const createTask = catchAsync(async (req, res, next) => {
  const { name, eventId } = req.body;
  const image = req.file?.path || null;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError('Evento no encontrado', 404));
  
  if (event.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Solo el creador del evento puede añadir tareas', 403));
  }

  const task = await Task.create({ name, event: eventId, image });
  await Event.findByIdAndUpdate(eventId, { $addToSet: { tasks: task._id } });

  res.status(201).json(task);
});

export const updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('event');
  if (!task) return next(new AppError('Tarea no encontrada', 404));

  if (task.event.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Solo el creador del evento puede editar tareas', 403));
  }

  if (req.file?.path && task.image) {
    const publicId = task.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(err => console.error(err));
  }

  const updated = await Task.findByIdAndUpdate(
    req.params.id,
    { ...req.body, image: req.file?.path || task.image },
    { new: true }
  );

  res.status(200).json(updated);
});

export const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('event');
  if (!task) return next(new AppError('Tarea no encontrada', 404));

  if (task.event.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Solo el creador del evento puede eliminar tareas', 403));
  }

  await Event.findByIdAndUpdate(task.event._id, { $pull: { tasks: task._id } });

  if (task.image) {
    const publicId = task.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(err => console.error(err));
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Tarea eliminada' });
});
