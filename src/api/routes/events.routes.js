import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  leaveEvent,
  getAttendees
} from '../controllers/events.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.js';

const router = Router();

// Rutas públicas
router.get('/', getAllEvents);
router.get('/:id/attendees', getAttendees);
router.get('/:id', getEventById);

// Rutas protegidas (requieren autenticación)
router.post('/', isAuth, upload.single('poster'), createEvent);
router.post('/:id/attend', isAuth, attendEvent);
router.delete('/:id/leave', isAuth, leaveEvent);
router.put('/:id', isAuth, upload.single('poster'), updateEvent);
router.delete('/:id', isAuth, deleteEvent);

export default router;
