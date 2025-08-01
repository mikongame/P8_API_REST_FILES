import express from "express";
import Task from "../models/Task.js";
import Plan from "../models/Plan.js";
import upload from "../middlewares/upload.js";
import cloudinary from "../middlewares/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const tasks = await Task.find().populate("plan");
  res.json(tasks);
});

router.get("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id).populate("plan");
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json(task);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, planId } = req.body;
    const image = req.file?.path || null;

    const task = await Task.create({ name, plan: planId, image });
    await Plan.findByIdAndUpdate(planId, { $addToSet: { tasks: task._id } });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al crear tarea", error });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (req.file?.path && task.image) {
      const publicId = task.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: req.file?.path || task.image },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar tarea", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      await Plan.findByIdAndUpdate(task.plan, { $pull: { tasks: task._id } });

      if (task.image) {
        const publicId = task.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar tarea", error });
  }
});

export default router;
