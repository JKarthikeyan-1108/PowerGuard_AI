import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { incidentsController } from './incidents.controller';
import { createIncidentSchema, updateIncidentSchema, getIncidentsSchema, createIncidentCommentSchema } from './incidents.validator';

const router = Router();
router.use(authenticate);

// GET /api/incidents
router.get('/', validate(getIncidentsSchema, 'query'), incidentsController.getIncidents);

// GET /api/incidents/:id
router.get('/:id', incidentsController.getIncidentById);

// POST /api/incidents
router.post('/', authorize('ADMIN', 'UTILITY_OFFICER'), validate(createIncidentSchema), incidentsController.createIncident);

// PATCH /api/incidents/:id
router.patch('/:id', authorize('ADMIN', 'UTILITY_OFFICER'), validate(updateIncidentSchema), incidentsController.updateIncident);

// POST /api/incidents/:id/comments
router.post('/:id/comments', validate(createIncidentCommentSchema), incidentsController.addComment);

export default router;
