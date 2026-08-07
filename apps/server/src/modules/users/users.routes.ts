import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { usersController } from './users.controller';
import { updateUserSchema } from './users.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authorize('ADMIN'), usersController.getUsers.bind(usersController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', usersController.getUserById.bind(usersController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', validate(updateUserSchema), usersController.updateUser.bind(usersController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Soft delete (suspend) user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', authorize('ADMIN'), usersController.deleteUser.bind(usersController));

/**
 * @swagger
 * /api/users/{id}/suspend:
 *   patch:
 *     summary: Suspend user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/:id/suspend', authorize('ADMIN'), usersController.suspendUser.bind(usersController));

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/:id/activate', authorize('ADMIN'), usersController.activateUser.bind(usersController));

export default router;
