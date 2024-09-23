"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticateJWT, messageController_1.createMessage);
router.get('/', authMiddleware_1.authenticateJWT, messageController_1.getMessages);
router.get('/chats', authMiddleware_1.authenticateJWT, messageController_1.getChats);
router.post('/notifications', authMiddleware_1.authenticateJWT, messageController_1.createNotification);
router.get('/notifications', authMiddleware_1.authenticateJWT, messageController_1.getNotifications);
exports.default = router;
