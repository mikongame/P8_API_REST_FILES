// Middleware global para manejo de errores
export const globalErrorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    // En producción borraríamos el stack
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

// Clase personalizada para errores operacionales (opcional, pero buena práctica)
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
