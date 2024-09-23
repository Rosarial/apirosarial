import { Router } from 'express';
import multer from 'multer';
import { startCheckin } from '../controllers/checkinController';
import { authenticateJWT } from '../middleware/authMiddleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const router = Router();

router.post('/start', authenticateJWT, startCheckin);

export default router;
