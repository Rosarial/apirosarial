import { Router } from 'express';
import { getFilteredStores, getStores } from '../controllers/storeController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getStores);
router.get('/', authenticateJWT, getFilteredStores);

export default router;
