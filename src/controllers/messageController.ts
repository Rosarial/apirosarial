import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/user';
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from '../utils';
import { Message } from '../models';
import { MessageTypes } from '../models/message';

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
export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }
  const { message, receiverId } = req.body;

  if (!message) {
    return errorResponse(res, 'Missing message', 400);
  }
  if (!receiverId) {
    return errorResponse(res, 'Missing receiverId', 400);
  }
  try {
    const receiverUser = await User.findOne({ where: { id: receiverId } });
    if (!receiverUser) {
      return validationErrorResponse(
        res,
        { senderId: 'Receiver user is not found' },
        'Validation error'
      );
    }
  } catch (error) {
    return errorResponse(res, 'Unexpected Error', 500);
  }

  try {
    const createdMessage = await Message.create({
      message,
      senderId: user.id,
      receiverId,
      type: MessageTypes.MESSAGE,
    });

    return successResponse(res, createdMessage, 'Message sended successfully');
  } catch (error) {
    return errorResponse(res, 'Error sending message', 500);
  }
};

export const createNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }
  const { message } = req.body;

  if (!message) {
    return errorResponse(res, 'Missing message', 400);
  }

  try {
    const createdMessage = await Message.create({
      message,
      senderId: user.id,
      receiverId: user.id,
      type: MessageTypes.NOTIFICATION,
    });

    return successResponse(res, createdMessage, 'Message sended successfully');
  } catch (error) {
    return errorResponse(res, 'Error sending message', 500);
  }
};

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
export const getChats = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const filters: any = {};
  filters[Op.or] = {
    senderId: [user.id],
    receiverId: [user.id],
  };
  try {
    const messages = await Message.findAll<any>({
      where: filters,
      include: [
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'userName', 'firstName', 'lastName'],
        },
        {
          model: User,
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
        receiver:
          message.receiver.id === user.id
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

    return successResponse(
      res,
      formattedMessages,
      'Messages fetched successfully'
    );
  } catch (error) {
    return errorResponse(error ?? res, 'Error fetching messages', 500);
  }
};

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
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const { receiverId } = req.query;

  if (!receiverId) {
    return errorResponse(res, 'Missing receiverId', 400);
  }
  const formattedReceiverId = parseInt(receiverId as string, 10);

  const filters: any = { type: MessageTypes.MESSAGE };
  filters[Op.or] = [
    {
      [Op.and]: {
        senderId: [user.id],
        receiverId: [formattedReceiverId],
      },
    },
    {
      [Op.and]: {
        senderId: [formattedReceiverId],
        receiverId: [user.id],
      },
    },
  ];
  try {
    const messages = await Message.findAll({
      where: filters,
      order: [['createdAt', 'ASC']],
    });

    return successResponse(res, messages, 'Messages fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Error fetching messages', 500);
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const filters: any = {
    type: MessageTypes.NOTIFICATION,
  };

  try {
    const messages = await Message.findAll({
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'userName', 'firstName', 'lastName'],
      },
      where: filters,
      order: [['createdAt', 'ASC']],
    });

    return successResponse(res, messages, 'Notifications fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Error fetching messages', 500);
  }
};
