import Task from '../models/Task.js';
import Event from '../models/Event.js';
import cloudinary from '../middlewares/cloudinary.js';

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('event');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('event');
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tarea', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { name, eventId } = req.body;
    const image = req.file?.path || null;

    // Verificar que el evento exists y el usuario es el creador
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador del evento puede añadir tareas' });
    }

    const task = await Task.create({ name, event: eventId, image });
    await Event.findByIdAndUpdate(eventId, { $addToSet: { tasks: task._id } });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear tarea', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('event');
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    // Verificar que el usuario es el creador del evento
    if (task.event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador del evento puede editar tareas' });
    }

    if (req.file?.path && task.image) {
      const publicId = task.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: req.file?.path || task.image },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tarea', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('event');
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Verificar que el usuario es el creador del evento
    if (task.event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador del evento puede eliminar tareas' });
    }

    await Event.findByIdAndUpdate(task.event._id, { $pull: { tasks: task._id } });

    if (task.image) {
      const publicId = task.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tarea', error: error.message });
  }
};
