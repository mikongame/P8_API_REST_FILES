import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (url, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'planify_seed', // Una carpeta separada para tenerlas organizadas
      public_id: publicId,
      overwrite: true
    });
    console.log(`✅ Subida exitosa: ${publicId}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error subiendo ${publicId}:`, error.message);
    return null;
  }
};

const migrate = async () => {
    console.log('🚀 Iniciando migración de imágenes a Cloudinary...');

    const images = {
        burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        hackathon: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        newyear: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=800&q=80',
        gaming: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
        cooking: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'
    };

    const cloudinaryUrls = {};

    for (const [key, url] of Object.entries(images)) {
        const result = await cloudinary.uploader.upload(url, {
          folder: 'planify_seed', 
          public_id: key,
          overwrite: true
        });
        console.log(`✅ Subida exitosa: ${key}`);
        cloudinaryUrls[key] = result.secure_url;
    }

    console.log('\n✨ ¡Migración completada! Aquí tienes las nuevas URLs para copiar en seed.js:\n');
    console.log(JSON.stringify(cloudinaryUrls, null, 2));
};

migrate();
