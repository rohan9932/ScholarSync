import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { validateBody } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.get('/', taskController.list);
router.post('/', validateBody(createTaskSchema), taskController.create);
router.patch('/:id', validateBody(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.remove);

export default router;
