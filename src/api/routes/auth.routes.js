import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);

export default router;
