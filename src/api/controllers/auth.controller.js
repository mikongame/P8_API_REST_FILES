import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../middlewares/error.middleware.js';

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('El email ya está registrado', 400));
  }

  const avatar = req.file?.path || null;
  const user = await User.create({ name, email, password, avatar });
  
  const token = generateToken(user._id);
  
  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    },
    token
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new AppError('Credenciales incorrectas', 400));
  }

  const token = generateToken(user._id);
  
  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    },
    token
  });
});
