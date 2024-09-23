"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const profile_1 = require("../models/profile");
const refreshToken_1 = require("../models/refreshToken");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
dotenv_1.default.config();
const secret = process.env.JWT_SECRET || 'secreckeKEY';
const generateAccessToken = (user) => {
    const expiresIn = '12h';
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: expiresIn });
    return {
        accessToken,
        expiresIn,
    };
    // return jwt.sign({ id: user.id, role: user.role }, secret as string, { expiresIn: '12h' });
};
const generateRefreshToken = async (user) => {
    const token = jsonwebtoken_1.default.sign({ id: user.id }, secret, {
        expiresIn: '30d', // Certifique-se de que a expiração está correta
    });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Atualize aqui para 30 dias
    await refreshToken_1.RefreshToken.create({
        userId: user.id,
        token,
        expiryDate,
    });
    return token;
};
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
/**
 * Handles user login
 *
 * @param req - The request object
 * @param res - The response object
 */
const login = async (req, res) => {
    // Destructure request body
    let { email, password, senha, deviceInfo } = req.body;
    /*
    if(!email || !password){
      return validationErrorResponse(res, 'Bad request')
    }
    */
    // If password is not provided, set it from the 'senha' field
    if (!password) {
        password = senha;
    }
    try {
        // Find user by email
        const user = await user_1.User.findOne({ where: { email } });
        if (!user) {
            // Return error if user is not found
            return (0, utils_1.errorResponse)(res, 'Usuário não encontrado! Verifique e tente novamente', 404);
        }
        // Check if password is valid
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            // Return error if credentials are invalid
            return (0, utils_1.errorResponse)(res, 'Credenciais inválidas! Verifique e tente novamente', 401);
        }
        // Generate access token
        const getAccessToken = generateAccessToken(user);
        const accessToken = getAccessToken.accessToken;
        const accessTokenExpiresIn = getAccessToken.expiresIn;
        // Generate refresh token
        const refreshToken = await generateRefreshToken(user);
        // Update or create user profile after login
        const profile = await profile_1.Profile.findOne({ where: { userId: user.id } });
        if (profile) {
            // Update existing profile
            profile.email = user.email;
            profile.deviceInfo = deviceInfo || profile.deviceInfo;
            profile.lastLogin = new Date();
            await profile.save();
        }
        else {
            // Create new profile
            await profile_1.Profile.create({
                userId: user.id,
                email: user.email,
                firstName: '',
                lastName: '',
                deviceInfo: deviceInfo || '',
                lastLogin: new Date(),
            });
        }
        // Return success response with user data
        return (0, utils_1.successResponse)(res, {
            accessToken,
            accessTokenExpiresIn,
            refreshToken,
            id: user?.id,
            role: user.role,
        }, 'Login successful');
    }
    catch (error) {
        // Return error response for internal server error
        return (0, utils_1.errorResponse)(error, 'Internal server error');
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return (0, utils_1.errorResponse)(res, 'Refresh Token is required', 400);
    }
    try {
        const storedToken = await refreshToken_1.RefreshToken.findOne({
            where: { token: refreshToken },
        });
        if (!storedToken) {
            return (0, utils_1.errorResponse)(res, 'Não foi possivel recuperar o Refresh Token', 403); // Atualize para 403
        }
        if (storedToken.expiryDate < new Date()) {
            return (0, utils_1.errorResponse)(res, 'Refresh Token expired', 403); // Atualize para 403
        }
        const user = await user_1.User.findByPk(storedToken.userId);
        if (!user) {
            return (0, utils_1.errorResponse)(res, 'User not found', 404);
        }
        const newAccessToken = generateAccessToken(user);
        return (0, utils_1.successResponse)(res, { accessToken: newAccessToken.accessToken }, 'Token refreshed successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Internal server error', 500);
    }
};
exports.refreshToken = refreshToken;
