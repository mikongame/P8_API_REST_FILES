import express from "express";
import Plan from "../models/Plan.js";
import Task from "../models/Task.js";
import upload from "../middlewares/upload.js";
import cloudinary from "../middlewares/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const plans = await Plan.find().populate("tasks");
  res.json(plans);
});

router.get("/:id", async (req, res) => {
  const plan = await Plan.findById(req.params.id).populate("tasks");
  if (!plan) return res.status(404).json({ message: "Plan no encontrado" });
  res.json(plan);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file?.path || null;

    const nuevoPlan = await Plan.create({ title, description, image });
    res.status(201).json(nuevoPlan);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el plan", error });
  }
});


router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { tasks, ...rest } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan no encontrado" });

    if (req.file?.path && plan.image) {
      const publicId = plan.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...rest, image: req.file?.path || plan.image },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar plan", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan no encontrado" });

    if (plan.image) {
      const publicId = plan.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Plan eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar plan", error });
  }
});

export default router;
