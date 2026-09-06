import { Router } from 'express';
import { applicationController } from '../controllers/applicationController.js';

const router = Router();

router.get('/', applicationController.list);
router.post('/', applicationController.create);
router.patch('/:id', applicationController.decide);

export default router;
