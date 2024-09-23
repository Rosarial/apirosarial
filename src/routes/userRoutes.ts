import { Router } from 'express';
import { createUser, getProfile, listUsers, updateProfile, updateUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/create', createUser);
router.put('/update/:id', authenticateJWT, updateUser);
router.get('/', authenticateJWT, listUsers);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
