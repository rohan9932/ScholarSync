import { Router } from 'express';
import { applicationController } from '../controllers/applicationController.js';
import { validateBody } from '../middleware/validate.js';
import {
  createApplicationSchema,
  decideApplicationSchema,
} from '../schemas/validationSchemas.js';

const router = Router();

router.get('/', applicationController.list);
router.post('/', validateBody(createApplicationSchema), applicationController.create);
router.patch('/:id', validateBody(decideApplicationSchema), applicationController.decide);

export default router;
