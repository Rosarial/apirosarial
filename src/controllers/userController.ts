import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import path from 'path';
import { Op } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Profile } from '../models/profile';
import { PromoterStore } from '../models/promoterStore';
import { User, UserRole } from '../models/user';
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from '../utils';
import { saveImageAndGetUrl } from '../utils/imageUtils';

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
export const createUser = async (req: Request, res: Response) => {
  const { email, password, role, active } = req.body;

  if (role && role === UserRole.PROMOTER) {
    return validationErrorResponse(res, { role: 'Invalid role' });
  }
  const existingUser = await User.findOne({ where: { email: email } });
  if (existingUser) {
    return validationErrorResponse(
      res,
      { email: 'Email is already registered' },
      'Validation error'
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || UserRole.PROMOTER,
      active: active !== undefined ? active : true,
      accountType: 1,
      creationTimestamp: new Date(),
      failedLogins: 0,
      hasAvatar: false,
      userName: 'Supervisor',
    });
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return successResponse(
      res,
      userWithoutPassword,
      'User created successfully'
    );
  } catch (error) {
    return errorResponse(res, 'Error creating user', 500);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
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
 *               storeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs das lojas atribuídas (somente para supervisores)
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro no servidor
 */

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { email, password, role, active, storeIds } = req.body;
  const currentUser = req.user;

  if (!currentUser) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) {
      if (currentUser.role !== UserRole.ADMIN) {
        return errorResponse(res, 'Only admin can change user role', 403);
      }

      user.role = role;
    }
    if (active !== undefined) user.active = active;

    await user.save();

    if (
      user.role === UserRole.SUPERVISOR &&
      storeIds &&
      Array.isArray(storeIds)
    ) {
      await PromoterStore.destroy({ where: { promoterId: user.id } });
      const promoterStores = storeIds.map((storeId) => ({
        storeId,
        promoterId: user.id,
      }));
      await PromoterStore.bulkCreate(promoterStores);
    }
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return successResponse(
      res,
      userWithoutPassword,
      'User updated successfully'
    );
  } catch (error) {
    return errorResponse(res, 'Error updating user', 500);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const {
    address,
    phone,
    photo,
    deviceInfo,
    firstName,
    lastName,
    email,
    active,
    storeIds,
    role,
  } = req.body;

  const currentUser = req.user;

  if (!currentUser) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  try {
    const profile = await Profile.findOne({ where: { userId } });
    const user = await User.findOne({ where: { id: userId } });

    if (!profile || !user) {
      return errorResponse(res, 'Profile or User not found', 404);
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    let imageUrl = profile.photo;

    // Verificar se a foto enviada é uma nova base64 ou uma URL existente
    if (photo && photo.base64Data) {
      imageUrl = saveImageAndGetUrl(photo, uploadDir, req);
    }

    profile.address = address ?? profile.address ?? '';
    profile.phone = phone ?? profile.phone ?? '';
    profile.photo = imageUrl ?? profile.photo ?? '';
    profile.firstName = firstName ?? profile.firstName ?? '';
    profile.lastName = lastName ?? profile.lastName ?? '';
    profile.fullName = lastName && firstName ? `${firstName} ${lastName}` : '';
    profile.deviceInfo =
      JSON.stringify(deviceInfo) ?? JSON.stringify(profile.deviceInfo) ?? '';

    if (email) profile.email = email;
    if (active !== undefined) profile.active = active;

    if (role) {
      if (currentUser.role !== UserRole.ADMIN) {
        return errorResponse(res, 'Only admin can change user role', 403);
      } else {
        user.role = role; // Atualiza a role diretamente na tabela users
      }
    }

    await profile.save();
    await user.save();

    if (
      user.role === UserRole.SUPERVISOR &&
      storeIds &&
      Array.isArray(storeIds)
    ) {
      await PromoterStore.destroy({ where: { promoterId: profile.id } });
      const promoterStores = storeIds.map((storeId) => ({
        storeId,
        promoterId: profile.id,
      }));
      await PromoterStore.bulkCreate(promoterStores);
    }

    const { password: _, ...userWithoutPassword } = profile.toJSON();
    const response = {
      ...userWithoutPassword,
      role: user.role,
      fullName: profile.fullName ?? '',
    };
    return successResponse(res, response, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating user', 400);
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
export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  // if (![UserRole.SUPERVISOR, UserRole.ADMIN].includes(user.role)) {
  //   return errorResponse(res, 'Access denied', 403);
  // }

  const { role, active, createdAt } = req.query;

  const filters: any = {};
  if (role) filters.role = role;
  if (active !== undefined) filters.active = active === 'true';
  if (createdAt)
    filters.createdAt = { [Op.gte]: new Date(createdAt as string) };

  try {
    const users = await User.findAll({
      where: filters,
      attributes: { exclude: ['password'] }, // Excluir o campo password
      include: [
        {
          model: Profile,
          as: 'profile', // O alias que você usou na associação
          attributes: [
            'firstName',
            'lastName',
            'address',
            'phone',
            'photo',
            'deviceInfo',
            'lastLogin',
            'createdAt',
            'updatedAt',
          ], // Campos desejados do perfil
        },
      ],
    });

    return successResponse(res, users, 'Users fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Error fetching users', 500);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [promoter, supervisor, admin]
 *                 currentPosition:
 *                   type: string
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro no servidor
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role; // Role do usuário autenticado

    const profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      return errorResponse(res, 'Profile not found', 404);
    }

    const profileWithRole = {
      ...profile.toJSON(),
      role: userRole,
      currentPosition: profile.currentPosition || 'Unknown', // Adicione a lógica necessária para definir currentPosition
    };

    return successResponse(
      res,
      profileWithRole,
      'Profile retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving profile', 500);
  }
};
