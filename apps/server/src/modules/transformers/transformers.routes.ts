import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { transformersController } from './transformers.controller';
import { getTransformersSchema, createTransformerSchema } from './transformers.validator';

const router = Router();
router.use(authenticate);

// GET /api/transformers
router.get('/', validate(getTransformersSchema, 'query'), transformersController.getTransformers);

// GET /api/transformers/:id
router.get('/:id', transformersController.getTransformerById);

// POST /api/transformers — Admin only
router.post('/', authorize('ADMIN'), validate(createTransformerSchema), transformersController.createTransformer);

export default router;
