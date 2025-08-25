## Planify Backend – API REST + WebSockets + Cloudinary

Aplicación backend para organizar planes colaborativos (como *La Noche de la Hamburguesa*) mediante tareas asignadas, en tiempo real, con imágenes alojadas en Cloudinary.

---

### Stack Tecnológico

* **Node.js** + **Express**
* **MongoDB Atlas** + Mongoose
* **Socket.io** (WebSockets)
* **Cloudinary** (almacenamiento de archivos)
* **Multer** (middleware de subida)
* **dotenv**, **readline**

---

### Funcionalidades

- CRUD completo para:

  - `Plan`: planificación colaborativa (título, descripción, imagen)
  - `Task`: tareas dentro de un plan (nombre, imagen, estado `done`)
  
- Relación entre modelos: un plan tiene un array de tareas

- Comunicación en tiempo real vía WebSockets:
  - `new-task`, `task-added`

- Subida y eliminación de imágenes con Cloudinary

- Script de semilla interactivo (`npm run seed`) con:
  - Datos predefinidos
  - Opción para introducir datos personalizados

---

## 📦 Gestión de Archivos (Cloudinary)

Este proyecto incluye subida de imágenes para ambos modelos:

- Las imágenes se suben mediante formularios `multipart/form-data`
- Se eliminan automáticamente de Cloudinary al borrar el recurso
- Compatible con Postman o interfaces web

#### Campos de imagen:

- **Plan:** campo `image`
- **Task:** campo `image`

---

### Comandos útiles

```bash
npm install       # Instalar dependencias
npm run dev       # Iniciar el servidor con nodemon
npm run seed      # Poblar la base de datos con planes y tareas
```

---

### Endpoints REST

| Método | Ruta         | Descripción                                       |
|--------|--------------|---------------------------------------------------|
| GET    | `/plans`     | Obtener todos los planes (con tareas)             |
| GET    | `/plans/:id` | Obtener un plan por ID                            |
| POST   | `/plans`     | Crear un nuevo plan (con imagen)                  |
| PUT    | `/plans/:id` | Editar un plan (puede actualizar imagen)          |
| DELETE | `/plans/:id` | Eliminar un plan (y su imagen en Cloudinary)      |
| GET    | `/tasks`     | Listar todas las tareas                           |
| POST   | `/tasks`     | Crear una nueva tarea (con imagen)                |
| PUT    | `/tasks/:id` | Editar una tarea (puede actualizar imagen)        |
| DELETE | `/tasks/:id` | Eliminar una tarea (y su imagen en Cloudinary)    |

---

### Conexión a MongoDB Atlas

* La base de datos tiene acceso público activado (`0.0.0.0/0`) para facilitar la corrección.
* Se utiliza un usuario **temporal y limitado** con permisos de escritura.
* La URI de conexión debe colocarse en el archivo `.env`.

📄 `.env` incluido por requerimiento de evaluación

Este repositorio contiene el archivo `.env` real para facilitar la corrección del proyecto.  
El usuario de MongoDB Atlas utilizado es **temporal y con permisos limitados**, y será eliminado después de la entrega.

> ⚠️ En entornos reales, nunca se deben subir credenciales sensibles a un repositorio público.


---

### Semilla

```bash
node seed.js
```

Permite elegir entre:

* Población automática con ejemplos clásicos (hamburguesas, cervezas, etc.)
* Introducción personalizada de planes y tareas por consola

---

### Inspiración pedagógica

Este proyecto toma como referencia el ejercicio realizado en otro curso llamado **“La Noche de la Hamburguesa”**, donde se explora la relación entre modelos en MongoDB mediante una estructura narrativa: un plan (evento o noche especial) que contiene múltiples tareas organizativas.
