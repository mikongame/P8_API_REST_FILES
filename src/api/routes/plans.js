import express from 'express';
import upload from '../middlewares/upload.js';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/plans.controller.js';

const router = express.Router();

router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.post('/', upload.single('image'), createPlan);
router.put('/:id', upload.single('image'), updatePlan);
router.delete('/:id', deletePlan);

export default router;
