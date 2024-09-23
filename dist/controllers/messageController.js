"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = exports.getMessages = exports.getChats = exports.createNotification = exports.createMessage = void 0;
const sequelize_1 = require("sequelize");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const models_1 = require("../models");
const message_1 = require("../models/message");
/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *               role:
 *                 type: string
 *                 description: Papel do usuário (promoter ou supervisor)
 *               active:
 *                 type: boolean
 *                 description: Indica se o usuário está ativo
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro no servidor
 */
const createMessage = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    const { message, receiverId } = req.body;
    if (!message) {
        return (0, utils_1.errorResponse)(res, 'Missing message', 400);
    }
    if (!receiverId) {
        return (0, utils_1.errorResponse)(res, 'Missing receiverId', 400);
    }
    try {
        const receiverUser = await user_1.User.findOne({ where: { id: receiverId } });
        if (!receiverUser) {
            return (0, utils_1.validationErrorResponse)(res, { senderId: 'Receiver user is not found' }, 'Validation error');
        }
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Unexpected Error', 500);
    }
    try {
        const createdMessage = await models_1.Message.create({
            message,
            senderId: user.id,
            receiverId,
            type: message_1.MessageTypes.MESSAGE,
        });
        return (0, utils_1.successResponse)(res, createdMessage, 'Message sended successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error sending message', 500);
    }
};
exports.createMessage = createMessage;
const createNotification = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    const { message } = req.body;
    if (!message) {
        return (0, utils_1.errorResponse)(res, 'Missing message', 400);
    }
    try {
        const createdMessage = await models_1.Message.create({
            message,
            senderId: user.id,
            receiverId: user.id,
            type: message_1.MessageTypes.NOTIFICATION,
        });
        return (0, utils_1.successResponse)(res, createdMessage, 'Message sended successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error sending message', 500);
    }
};
exports.createNotification = createNotification;
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários com filtros por role, ativo e data de criação
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [promoter, supervisor, admin]
 *         description: Filtro por role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtro por ativo
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro por data de criação
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro no servidor
 */
const getChats = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    const filters = {};
    filters[sequelize_1.Op.or] = {
        senderId: [user.id],
        receiverId: [user.id],
    };
    try {
        const messages = await models_1.Message.findAll({
            where: filters,
            include: [
                {
                    model: user_1.User,
                    as: 'receiver',
                    attributes: ['id', 'userName', 'firstName', 'lastName'],
                },
                {
                    model: user_1.User,
                    as: 'sender',
                    attributes: ['id', 'userName', 'firstName', 'lastName'],
                },
            ],
            // TODO: fazer retornar a última mensagem enviada/recebida
            order: [['createdAt', 'DESC']],
            group: [
                'receiver.user_id',
                'receiver.user_name',
                'receiver.user_first_name',
            ],
        });
        const formattedMessages = messages.map((message) => {
            return {
                lastMessage: {
                    id: message.id,
                    message: message.message,
                    createdAt: message.createdAt,
                },
                receiver: message.receiver.id === user.id
                    ? {
                        id: message.sender.id,
                        userName: message.sender.userName,
                        firstName: message.sender.firstName,
                        lastName: message.sender.lastName,
                        foto: '',
                    }
                    : {
                        id: message.receiver.id,
                        userName: message.receiver.userName,
                        firstName: message.receiver.firstName,
                        lastName: message.receiver.lastName,
                        foto: '',
                    },
            };
        });
        return (0, utils_1.successResponse)(res, formattedMessages, 'Messages fetched successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(error ?? res, 'Error fetching messages', 500);
    }
};
exports.getChats = getChats;
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários com filtros por role, ativo e data de criação
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [promoter, supervisor, admin]
 *         description: Filtro por role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtro por ativo
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtro por data de criação
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro no servidor
 */
const getMessages = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    const { receiverId } = req.query;
    if (!receiverId) {
        return (0, utils_1.errorResponse)(res, 'Missing receiverId', 400);
    }
    const formattedReceiverId = parseInt(receiverId, 10);
    const filters = { type: message_1.MessageTypes.MESSAGE };
    filters[sequelize_1.Op.or] = [
        {
            [sequelize_1.Op.and]: {
                senderId: [user.id],
                receiverId: [formattedReceiverId],
            },
        },
        {
            [sequelize_1.Op.and]: {
                senderId: [formattedReceiverId],
                receiverId: [user.id],
            },
        },
    ];
    try {
        const messages = await models_1.Message.findAll({
            where: filters,
            order: [['createdAt', 'ASC']],
        });
        return (0, utils_1.successResponse)(res, messages, 'Messages fetched successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error fetching messages', 500);
    }
};
exports.getMessages = getMessages;
const getNotifications = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    const filters = {
        type: message_1.MessageTypes.NOTIFICATION,
    };
    try {
        const messages = await models_1.Message.findAll({
            include: {
                model: user_1.User,
                as: 'sender',
                attributes: ['id', 'userName', 'firstName', 'lastName'],
            },
            where: filters,
            order: [['createdAt', 'ASC']],
        });
        return (0, utils_1.successResponse)(res, messages, 'Notifications fetched successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error fetching messages', 500);
    }
};
exports.getNotifications = getNotifications;
