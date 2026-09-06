import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';

const router = Router();

router.get('/', bookingController.list);
router.post('/', bookingController.create);
router.patch('/:id', bookingController.decide);

export default router;
