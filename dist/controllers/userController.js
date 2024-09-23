"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.listUsers = exports.updateProfile = exports.updateUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const profile_1 = require("../models/profile");
const promoterStore_1 = require("../models/promoterStore");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const imageUtils_1 = require("../utils/imageUtils");
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
const createUser = async (req, res) => {
    const { email, password, role, active } = req.body;
    if (role && role === user_1.UserRole.PROMOTER) {
        return (0, utils_1.validationErrorResponse)(res, { role: 'Invalid role' });
    }
    const existingUser = await user_1.User.findOne({ where: { email: email } });
    if (existingUser) {
        return (0, utils_1.validationErrorResponse)(res, { email: 'Email is already registered' }, 'Validation error');
    }
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await user_1.User.create({
            email,
            password: hashedPassword,
            role: role || user_1.UserRole.PROMOTER,
            active: active !== undefined ? active : true,
            accountType: 1,
            creationTimestamp: new Date(),
            failedLogins: 0,
            hasAvatar: false,
            userName: 'Supervisor',
        });
        const { password: _, ...userWithoutPassword } = newUser.toJSON();
        return (0, utils_1.successResponse)(res, userWithoutPassword, 'User created successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error creating user', 500);
    }
};
exports.createUser = createUser;
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
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, role, active, storeIds } = req.body;
    const currentUser = req.user;
    if (!currentUser) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    try {
        const user = await user_1.User.findByPk(id);
        if (!user) {
            return (0, utils_1.errorResponse)(res, 'User not found', 404);
        }
        if (email)
            user.email = email;
        if (password)
            user.password = await bcryptjs_1.default.hash(password, 10);
        if (role) {
            if (currentUser.role !== user_1.UserRole.ADMIN) {
                return (0, utils_1.errorResponse)(res, 'Only admin can change user role', 403);
            }
            user.role = role;
        }
        if (active !== undefined)
            user.active = active;
        await user.save();
        if (user.role === user_1.UserRole.SUPERVISOR &&
            storeIds &&
            Array.isArray(storeIds)) {
            await promoterStore_1.PromoterStore.destroy({ where: { promoterId: user.id } });
            const promoterStores = storeIds.map((storeId) => ({
                storeId,
                promoterId: user.id,
            }));
            await promoterStore_1.PromoterStore.bulkCreate(promoterStores);
        }
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return (0, utils_1.successResponse)(res, userWithoutPassword, 'User updated successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error updating user', 500);
    }
};
exports.updateUser = updateUser;
const updateProfile = async (req, res) => {
    const userId = req.user?.id;
    const { address, phone, photo, deviceInfo, firstName, lastName, email, active, storeIds, role, } = req.body;
    const currentUser = req.user;
    if (!currentUser) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    try {
        const profile = await profile_1.Profile.findOne({ where: { userId } });
        const user = await user_1.User.findOne({ where: { id: userId } });
        if (!profile || !user) {
            return (0, utils_1.errorResponse)(res, 'Profile or User not found', 404);
        }
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        let imageUrl = profile.photo;
        // Verificar se a foto enviada é uma nova base64 ou uma URL existente
        if (photo && photo.base64Data) {
            imageUrl = (0, imageUtils_1.saveImageAndGetUrl)(photo, uploadDir, req);
        }
        profile.address = address ?? profile.address ?? '';
        profile.phone = phone ?? profile.phone ?? '';
        profile.photo = imageUrl ?? profile.photo ?? '';
        profile.firstName = firstName ?? profile.firstName ?? '';
        profile.lastName = lastName ?? profile.lastName ?? '';
        profile.fullName = lastName && firstName ? `${firstName} ${lastName}` : '';
        profile.deviceInfo =
            JSON.stringify(deviceInfo) ?? JSON.stringify(profile.deviceInfo) ?? '';
        if (email)
            profile.email = email;
        if (active !== undefined)
            profile.active = active;
        if (role) {
            if (currentUser.role !== user_1.UserRole.ADMIN) {
                return (0, utils_1.errorResponse)(res, 'Only admin can change user role', 403);
            }
            else {
                user.role = role; // Atualiza a role diretamente na tabela users
            }
        }
        await profile.save();
        await user.save();
        if (user.role === user_1.UserRole.SUPERVISOR &&
            storeIds &&
            Array.isArray(storeIds)) {
            await promoterStore_1.PromoterStore.destroy({ where: { promoterId: profile.id } });
            const promoterStores = storeIds.map((storeId) => ({
                storeId,
                promoterId: profile.id,
            }));
            await promoterStore_1.PromoterStore.bulkCreate(promoterStores);
        }
        const { password: _, ...userWithoutPassword } = profile.toJSON();
        const response = {
            ...userWithoutPassword,
            role: user.role,
            fullName: profile.fullName ?? '',
        };
        return (0, utils_1.successResponse)(res, response, 'User updated successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error updating user', 400);
    }
};
exports.updateProfile = updateProfile;
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
const listUsers = async (req, res) => {
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    // if (![UserRole.SUPERVISOR, UserRole.ADMIN].includes(user.role)) {
    //   return errorResponse(res, 'Access denied', 403);
    // }
    const { role, active, createdAt } = req.query;
    const filters = {};
    if (role)
        filters.role = role;
    if (active !== undefined)
        filters.active = active === 'true';
    if (createdAt)
        filters.createdAt = { [sequelize_1.Op.gte]: new Date(createdAt) };
    try {
        const users = await user_1.User.findAll({
            where: filters,
            attributes: { exclude: ['password'] }, // Excluir o campo password
            include: [
                {
                    model: profile_1.Profile,
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
        return (0, utils_1.successResponse)(res, users, 'Users fetched successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error fetching users', 500);
    }
};
exports.listUsers = listUsers;
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
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role; // Role do usuário autenticado
        const profile = await profile_1.Profile.findOne({ where: { userId } });
        if (!profile) {
            return (0, utils_1.errorResponse)(res, 'Profile not found', 404);
        }
        const profileWithRole = {
            ...profile.toJSON(),
            role: userRole,
            currentPosition: profile.currentPosition || 'Unknown', // Adicione a lógica necessária para definir currentPosition
        };
        return (0, utils_1.successResponse)(res, profileWithRole, 'Profile retrieved successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error retrieving profile', 500);
    }
};
exports.getProfile = getProfile;
