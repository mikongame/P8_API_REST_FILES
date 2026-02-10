import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/User.js';
import Event from '../api/models/Event.js';
import Task from '../api/models/Task.js';
import connectDB from './db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Limpiar base de datos
    console.log('🗑️  Limpiando base de datos...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Task.deleteMany({});

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    
    const users = await User.create([
      {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: '123456' // Se hasheará automáticamente por el pre-save hook
      },
      {
        name: 'María García',
        email: 'maria@test.com',
        password: '123456'
      },
      {
        name: 'Carlos López',
        email: 'carlos@test.com',
        password: '123456'
      },
      {
        name: 'Ana Martínez',
        email: 'ana@test.com',
        password: '123456'
      },
      {
        name: 'Pedro Sánchez',
        email: 'pedro@test.com',
        password: '123456'
      }
    ]);

    console.log(`✅ ${users.length} usuarios creados`);

    // Crear eventos
    console.log('🎉 Creando eventos...');
    
    const events = await Event.create([
      {
        title: 'Noche de la Hamburguesa',
        description: 'Evento clásico para amantes de las hamburguesas gourmet. Traed vuestras mejores recetas!',
        date: new Date('2025-12-31T20:00:00'),
        location: 'Casa de Juan',
        poster: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        createdBy: users[0]._id,
        attendees: [users[1]._id, users[2]._id, users[3]._id]
      },
      {
        title: 'Hackathon de Fin de Año',
        description: 'Maratón de programación de 24 horas. Pizza y café incluidos.',
        date: new Date('2025-12-28T10:00:00'),
        location: 'Centro de Innovación TechHub',
        poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        createdBy: users[1]._id,
        attendees: [users[0]._id, users[2]._id, users[4]._id]
      },
      {
        title: 'Fiesta de Año Nuevo',
        description: 'Celebración de fin de año con música, comida y fuegos artificiales.',
        date: new Date('2025-12-31T22:00:00'),
        location: 'Azotea The Sky Lounge',
        poster: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=800&q=80',
        createdBy: users[2]._id,
        attendees: [users[0]._id, users[1]._id, users[3]._id, users[4]._id]
      },
      {
        title: 'Torneo de Videojuegos',
        description: 'Competición amistosa de videojuegos retro. Trae tu mando favorito.',
        date: new Date('2025-12-29T16:00:00'),
        location: 'GameZone Arena',
        poster: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
        createdBy: users[3]._id,
        attendees: [users[1]._id, users[4]._id]
      },
      {
        title: 'Clase de Cocina Italiana',
        description: 'Aprende a hacer pasta fresca y tiramisu auténtico.',
        date: new Date('2026-01-05T18:00:00'),
        location: 'Escuela Culinaria La Dolce Vita',
        poster: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
        createdBy: users[4]._id,
        attendees: [users[0]._id, users[2]._id]
      }
    ]);

    console.log(`✅ ${events.length} eventos creados`);

    // Actualizar referencias de usuarios
    await User.findByIdAndUpdate(users[0]._id, {
      createdEvents: [events[0]._id],
      attendedEvents: [events[1]._id, events[2]._id, events[4]._id]
    });
    
    await User.findByIdAndUpdate(users[1]._id, {
      createdEvents: [events[1]._id],
      attendedEvents: [events[0]._id, events[2]._id, events[3]._id]
    });
    
    await User.findByIdAndUpdate(users[2]._id, {
      createdEvents: [events[2]._id],
      attendedEvents: [events[0]._id, events[1]._id, events[4]._id]
    });
    
    await User.findByIdAndUpdate(users[3]._id, {
      createdEvents: [events[3]._id],
      attendedEvents: [events[0]._id, events[2]._id]
    });
    
    await User.findByIdAndUpdate(users[4]._id, {
      createdEvents: [events[4]._id],
      attendedEvents: [events[1]._id, events[2]._id, events[3]._id]
    });

    // Crear tareas para cada evento
    console.log('📝 Creando tareas...');
    
    const tasksData = [
      // Tareas para Noche de la Hamburguesa
      { name: 'Comprar carne de hamburguesa', done: true, event: events[0]._id },
      { name: 'Preparar salsas caseras', done: false, event: events[0]._id },
      { name: 'Comprar pan de hamburguesa artesanal', done: true, event: events[0]._id },
      { name: 'Traer bebidas', done: false, event: events[0]._id },
      { name: 'Montar la parrilla', done: false, event: events[0]._id },
      
      // Tareas para Hackathon
      { name: 'Configurar repositorio GitHub', done: true, event: events[1]._id },
      { name: 'Preparar presentación inicial', done: true, event: events[1]._id },
      { name: 'Pedir pizzas', done: false, event: events[1]._id },
      { name: 'Preparar café y snacks', done: false, event: events[1]._id },
      
      // Tareas para Fiesta de Año Nuevo
      { name: 'Contratar DJ', done: true, event: events[2]._id },
      { name: 'Decorar el espacio', done: false, event: events[2]._id },
      { name: 'Comprar champán', done: false, event: events[2]._id },
      { name: 'Preparar lista de reproducción de reserva', done: true, event: events[2]._id },
      { name: 'Organizar servicio de catering', done: false, event: events[2]._id },
      
      // Tareas para Torneo de Videojuegos
      { name: 'Configurar consolas', done: true, event: events[3]._id },
      { name: 'Verificar mandos funcionan', done: true, event: events[3]._id },
      { name: 'Preparar bracket del torneo', done: false, event: events[3]._id },
      
      // Tareas para Clase de Cocina
      { name: 'Comprar ingredientes frescos', done: false, event: events[4]._id },
      { name: 'Preparar estaciones de trabajo', done: true, event: events[4]._id },
      { name: 'Imprimir recetas', done: false, event: events[4]._id }
    ];

    const tasks = await Task.create(tasksData);
    console.log(`✅ ${tasks.length} tareas creadas`);

    // Actualizar eventos con sus tareas
    for (const event of events) {
      const eventTasks = tasks.filter(task => task.event.toString() === event._id.toString());
      event.tasks = eventTasks.map(task => task._id);
      await event.save();
    }

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${users.length} usuarios creados`);
    console.log(`   - ${events.length} eventos creados`);
    console.log(`   - ${tasks.length} tareas creadas`);
    console.log('\n🔑 Credenciales de prueba (todas con password: 123456):');
    users.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    console.log('\n💡 Ahora puedes iniciar sesión con cualquiera de estos usuarios');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    process.exit(1);
  }
};

seedDatabase();
