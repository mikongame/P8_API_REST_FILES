# Guía de Despliegue en Vercel 🚀

Este proyecto ya está configurado para un despliegue sencillo en Vercel gracias a los archivos `vercel.json` añadidos.

## Prerrequisitos
- Tener una cuenta en [Vercel](https://vercel.com).
- Tener instalado Vercel CLI: `npm i -g vercel`.

## 1. Desplegar Backend

1. Sitúate en la raíz del proyecto (donde está el `package.json` del backend).
2. Ejecuta:
   ```bash
   vercel
   ```
3. Sigue las instrucciones (Set up and deploy? [Y], Link to existing project? [N], etc.).
4. **IMPORTANTE**: Ve al dashboard de Vercel del proyecto backend -> Settings -> Environment Variables.
   Añade las siguientes variables de tu `.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Una vez desplegado, copia la URL (ej: `https://tu-backend.vercel.app`).

## 2. Desplegar Frontend

1. Ve a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Ejecuta:
   ```bash
   vercel
   ```
3. Sigue las instrucciones. Vercel detectará automáticamente que es un proyecto Vite (`output directory: dist`).
4. **IMPORTANTE**: Si tu frontend necesita saber la URL del backend, ve a Settings -> Environment Variables y añade:
   - `VITE_API_URL`: La URL del backend que copiaste en el paso 1 (sin barra al final, ej: `https://tu-backend.vercel.app`).
   *Nota: Asegúrate de que `src/utils/api.js` use `import.meta.env.VITE_API_URL || 'http://localhost:3000'`.*

5. ¡Listo! Tu aplicación Full Stack debería estar funcionando en producción.

## Verificación Final
- Entra a la URL del frontend desplegado.
- Registra un nuevo usuario.
- Crea un evento (prueba la subida de imagen a Cloudinary).
- Disfruta de tu aplicación profesional "Human Senior Dev". 👨‍💻
