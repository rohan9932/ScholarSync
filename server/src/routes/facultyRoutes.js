import { Router } from 'express';
import { facultyController } from '../controllers/facultyController.js';

const router = Router();

router.get('/', facultyController.list);
router.get('/:id', facultyController.getOne);
router.get('/:id/schedule', facultyController.getSchedule);
router.get('/:id/free-slots', facultyController.getFreeSlots);

export default router;
