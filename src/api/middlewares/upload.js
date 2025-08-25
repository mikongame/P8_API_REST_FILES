import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // folder: 'planify', // puedes comentar esta línea si quieres evitar guardar en carpeta fija
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage });

export default upload;
