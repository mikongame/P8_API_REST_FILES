import Event from '../models/Event.js';
import User from '../models/User.js';
import cloudinary from '../middlewares/cloudinary.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../middlewares/error.middleware.js';

export const getAllEvents = catchAsync(async (req, res) => {
  const { sortBy = 'date', order = 'asc' } = req.query;
  
  if (sortBy === 'attendees') {
    const events = await Event.aggregate([
      { $addFields: { attendeeCount: { $size: '$attendees' } } },
      { $sort: { attendeeCount: order === 'asc' ? 1 : -1 } },
      { $lookup: { from: 'tasks', localField: 'tasks', foreignField: '_id', as: 'tasks' } },
      { $lookup: { from: 'users', localField: 'attendees', foreignField: '_id', as: 'attendees' } },
      { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
    ]);
    return res.status(200).json(events);
  }
  
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };
  
  const events = await Event.find()
    .populate('tasks')
    .populate('attendees', 'name avatar')
    .populate('createdBy', 'name')
    .sort(sortOptions);
    
  res.status(200).json(events);
});

export const getEventById = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('tasks')
    .populate('attendees', 'name email avatar')
    .populate('createdBy', 'name email');
    
  if (!event) return next(new AppError('Evento no encontrado', 404));
  res.status(200).json(event);
});

export const createEvent = catchAsync(async (req, res) => {
  const { title, description, date, location } = req.body;
  const poster = req.file?.path || null;
  const createdBy = req.user._id;

  const event = await Event.create({
    title, description, date, location, poster, createdBy
  });
  
  await User.findByIdAndUpdate(createdBy, {
    $addToSet: { createdEvents: event._id }
  });

  res.status(201).json(event);
});

export const updateEvent = catchAsync(async (req, res, next) => {
  const { tasks, attendees, ...rest } = req.body;
  const event = await Event.findById(req.params.id);
  
  if (!event) return next(new AppError('Evento no encontrado', 404));

  if (event.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Solo el creador puede editar el evento', 403));
  }

  // Limpieza de imagen antigua si se sube una nueva
  if (req.file?.path && event.poster) {
    const publicId = event.poster.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(err => console.warn('Error borrando imagen antigua:', err));
  }

  const updated = await Event.findByIdAndUpdate(
    req.params.id,
    { ...rest, poster: req.file?.path || event.poster },
    { new: true }
  ).populate('tasks').populate('attendees', 'name avatar');

  res.status(200).json(updated);
});

export const deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) return next(new AppError('Evento no encontrado', 404));

  if (event.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Solo el creador puede eliminar el evento', 403));
  }

  if (event.poster) {
    const publicId = event.poster.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(err => console.warn('Error borrando imagen:', err));
  }

  await User.findByIdAndUpdate(event.createdBy, { $pull: { createdEvents: event._id } });
  
  await User.updateMany(
    { _id: { $in: event.attendees } },
    { $pull: { attendedEvents: event._id } }
  );

  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Evento eliminado' });
});

export const attendEvent = catchAsync(async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError('Evento no encontrado', 404));

  if (event.attendees.includes(userId)) {
    return next(new AppError('Ya estás registrado en este evento', 400));
  }

  await Event.findByIdAndUpdate(eventId, { $addToSet: { attendees: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { attendedEvents: eventId } });

  res.status(200).json({ message: 'Asistencia confirmada' });
});

export const leaveEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  await Event.findByIdAndUpdate(eventId, { $pull: { attendees: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { attendedEvents: eventId } });

  res.status(200).json({ message: 'Asistencia cancelada' });
});

export const getAttendees = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('attendees', 'name email avatar');
  
  if (!event) return next(new AppError('Evento no encontrado', 404));

  res.status(200).json(event.attendees);
});
