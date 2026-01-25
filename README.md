# Eventify - Full Stack Event Management System

Sistema completo de gestión de eventos evolucionado desde "Planify" para el Ejercicio 10.

## 🚀 Tecnologías
- **Backend**: Express, MongoDB (Mongoose), Cloudinary (Multer), JWT, Bcrypt.
- **Frontend**: Vanilla JavaScript SPA, Vite, CSS moderno.

## ✅ Requerimientos Implementados
- **Autenticación**: Registro con avatar, auto-login y persistencia JWT.
- **Eventos**: CRUD completo, carga de carteles (posters), gestión de asistentes y autoría.
- **Tareas**: Gestión de tareas organizativas dentro de eventos.
- **UX/UI**: SPA sin recarga de página, estados de carga (LoadingSpinner), manejo de errores amigable y diseño responsive.
- **Arquitectura**: Componentización (Header, Card, FormInput, etc.) y Fetch único reutilizable.

## 🛠️ Instalación y Uso

1. **Backend**:
   ```bash
   npm install
   # Configurar .env (MONGO_URI, JWT_SECRET, CLOUDINARY_*)
   npm run seed  # Cargar datos de prueba
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 👥 Usuarios de Prueba (Password: 123456)
- juan@test.com
- maria@test.com
- carlos@test.com
- ana@test.com
- pedro@test.com
