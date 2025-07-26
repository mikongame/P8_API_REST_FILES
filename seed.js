import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import Plan from "./models/Plan.js";
import Task from "./models/Task.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise((res) => rl.question(q, res));

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB para semilla");

    await Task.deleteMany();
    await Plan.deleteMany();

    const useDefault = (await ask("¿Usar datos predefinidos? (s/n): ")).toLowerCase() === "s";

    if (useDefault) {
      const planImage1 = "https://res.cloudinary.com/dscnxo4mi/image/upload/v1753561466/photo-1521305916504-4a1121188589_irelid.jpg";
      const planImage2 = "https://res.cloudinary.com/dscnxo4mi/image/upload/v1753560890/photo-1465188035480-cf3a60801ea5_tlbpxo.jpg";

      const taskImage1 = "https://res.cloudinary.com/dscnxo4mi/image/upload/v1753561793/photo-1752630169799-fc5d4b48a922_ot4jvj.jpg";
      const taskImage2 = "https://res.cloudinary.com/dscnxo4mi/image/upload/v1753561533/photo-1689888393526-35563a50550e_kqyxbm.jpg";
      const taskImage3 = "https://res.cloudinary.com/dscnxo4mi/image/upload/v1753561656/photo-1625217527288-93919c99650a_xzrbwi.jpg";

      const plan1 = await Plan.create({
        title: "Noche de la Hamburguesa",
        description: "Plan para cenar juntos en casa de Juan",
        image: planImage1
      });

      const plan2 = await Plan.create({
        title: "Fin de semana en la montaña",
        description: "Organización previa a la escapada",
        image: planImage2
      });

      const task1 = await Task.create({ name: "Comprar pan de hamburguesa", plan: plan1._id, image: taskImage1 });
      const task2 = await Task.create({ name: "Traer cerveza", plan: plan1._id, image: taskImage2 });
      const task3 = await Task.create({ name: "Revisar ruta GPS", plan: plan2._id, image: taskImage3 });

      await Plan.findByIdAndUpdate(plan1._id, { $addToSet: { tasks: { $each: [task1._id, task2._id] } } });
      await Plan.findByIdAndUpdate(plan2._id, { $addToSet: { tasks: task3._id } });

      console.log("Datos de prueba con imágenes cargados");
    } else {
      const numPlanes = parseInt(await ask("¿Cuántos planes quieres crear?: "), 10);

      for (let i = 0; i < numPlanes; i++) {
        const title = await ask(`Título del plan ${i + 1}: `);
        const description = await ask(`Descripción: `);
        const image = await ask(`URL de imagen del plan (puede estar vacía): `);

        const plan = await Plan.create({ title, description, image: image || undefined });

        const numTasks = parseInt(await ask(`¿Cuántas tareas para "${title}"?: `), 10);
        const taskIds = [];

        for (let j = 0; j < numTasks; j++) {
          const name = await ask(` - Nombre de la tarea ${j + 1}: `);
          const taskImage = await ask(` - Imagen (opcional): `);
          const task = await Task.create({ name, plan: plan._id, image: taskImage || undefined });
          taskIds.push(task._id);
        }

        await Plan.findByIdAndUpdate(plan._id, { $addToSet: { tasks: { $each: taskIds } } });
        console.log(`Plan "${title}" creado con ${taskIds.length} tareas.`);
      }
    }

    console.log("Seed finalizado");
    rl.close();
    process.exit();
  } catch (error) {
    console.error("Error al ejecutar semilla:", error);
    rl.close();
    process.exit(1);
  }
};

seed();
