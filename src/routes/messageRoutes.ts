import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  createMessage,
  getMessages,
  getChats,
  getNotifications,
  createNotification,
} from '../controllers/messageController';

const router = Router();

router.post('/', authenticateJWT, createMessage);
router.get('/', authenticateJWT, getMessages);
router.get('/chats', authenticateJWT, getChats);
router.post('/notifications', authenticateJWT, createNotification);
router.get('/notifications', authenticateJWT, getNotifications);

export default router;
