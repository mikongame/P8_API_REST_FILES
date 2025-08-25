import Plan from '../models/Plan.js';
import cloudinary from '../middlewares/cloudinary.js';

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().populate('tasks');
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los planes', error });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('tasks');
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el plan', error });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file?.path || null;

    const nuevoPlan = await Plan.create({ title, description, image });
    res.status(201).json(nuevoPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el plan', error });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { tasks, ...rest } = req.body;
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });

    if (req.file?.path && plan.image) {
      const publicId = plan.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...rest, image: req.file?.path || plan.image },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar plan', error });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });

    if (plan.image) {
      const publicId = plan.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({ message: 'Plan eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar plan', error });
  }
};
