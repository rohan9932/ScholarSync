import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { validateBody } from '../middleware/validate.js';
import {
  createBookingSchema,
  decideBookingSchema,
} from '../schemas/validationSchemas.js';

const router = Router();

router.get('/', bookingController.list);
router.post('/', validateBody(createBookingSchema), bookingController.create);
router.patch('/:id', validateBody(decideBookingSchema), bookingController.decide);

export default router;
