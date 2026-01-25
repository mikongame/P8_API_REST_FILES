import Event from '../models/Event.js';
import User from '../models/User.js';
import cloudinary from '../middlewares/cloudinary.js';

export const getAllEvents = async (req, res) => {
  try {
    const { sortBy = 'date', order = 'asc' } = req.query;
    
    // Si queremos ordenar por cantidad de asistentes
    if (sortBy === 'attendees') {
      const events = await Event.aggregate([
        {
          $addFields: {
            attendeeCount: { $size: '$attendees' }
          }
        },
        { $sort: { attendeeCount: order === 'asc' ? 1 : -1 } },
        {
          $lookup: {
            from: 'tasks',
            localField: 'tasks',
            foreignField: '_id',
            as: 'tasks'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'attendees',
            foreignField: '_id',
            as: 'attendees'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy'
          }
        },
        {
          $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
        }
      ]);
      return res.status(200).json(events);
    }
    
    // Ordenación normal por fecha
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    
    const events = await Event.find()
      .populate('tasks')
      .populate('attendees', 'name avatar')
      .populate('createdBy', 'name')
      .sort(sortOptions);
      
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los eventos', error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('tasks')
      .populate('attendees', 'name email avatar')
      .populate('createdBy', 'name email');
      
    if (!event) return res.status(404).json({ message: 'Evento no encontrado' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el evento', error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const poster = req.file?.path || null;
    const createdBy = req.user._id;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      poster,
      createdBy
    });
    
    // Añadir a eventos creados del usuario
    await User.findByIdAndUpdate(createdBy, {
      $addToSet: { createdEvents: event._id }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el evento', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { tasks, attendees, ...rest } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: 'Evento no encontrado' });

    // Verificar que el usuario es el creador
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador puede editar el evento' });
    }

    // Si hay nueva imagen, eliminar la anterior
    if (req.file?.path && event.poster) {
      const publicId = event.poster.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { ...rest, poster: req.file?.path || event.poster },
      { new: true }
    ).populate('tasks').populate('attendees', 'name avatar');

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: 'Evento no encontrado' });

    // Verificar que el usuario es el creador
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el creador puede eliminar el evento' });
    }

    // Eliminar imagen si existe
    if (event.poster) {
      const publicId = event.poster.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Eliminar referencia del usuario creador
    await User.findByIdAndUpdate(event.createdBy, {
      $pull: { createdEvents: event._id }
    });

    // Eliminar referencia de todos los asistentes
    await User.updateMany(
      { _id: { $in: event.attendees } },
      { $pull: { attendedEvents: event._id } }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

// Confirmar asistencia
export const attendEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificar si ya asiste
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Ya estás registrado en este evento' });
    }

    // Añadir a ambas colecciones
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { attendees: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { attendedEvents: eventId }
    });

    res.status(200).json({ message: 'Asistencia confirmada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar asistencia', error: error.message });
  }
};

// Cancelar asistencia
export const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    await Event.findByIdAndUpdate(eventId, {
      $pull: { attendees: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { attendedEvents: eventId }
    });

    res.status(200).json({ message: 'Asistencia cancelada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar asistencia', error: error.message });
  }
};

// Obtener asistentes de un evento
export const getAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email avatar');
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.status(200).json(event.attendees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asistentes', error: error.message });
  }
};
