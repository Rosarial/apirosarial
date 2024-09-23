import { Router } from 'express';
import { checkout, checkoutDetails } from '../controllers/checkoutController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
// checkout
router.post('/', authenticateJWT, checkout);
router.get('/details', authenticateJWT, checkoutDetails);

export default router;
