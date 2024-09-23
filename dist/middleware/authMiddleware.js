"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const tokenUtils_1 = require("../utils/tokenUtils");
/**
 * Middleware to authenticate JWT token
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   200:
 *     description: Token is valid
 *     schema:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *             role:
 *               type: string
 *               enum: [admin, store, promoter, customer]
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Forbidden
 *   404:
 *     description: User not found
 */
const authenticateJWT = async (req, res, next) => {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    // If there is no authorization header, return unauthorized
    if (!authHeader) {
        return (0, utils_1.errorResponse)(res, 'Unauthorized', 401);
    }
    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];
    try {
        // Verify the token and get the decoded payload
        const decoded = (await (0, tokenUtils_1.verifyToken)(token));
        if (decoded && decoded['id']) {
            const userId = decoded['id'];
            // Find the user by the decoded payload's id
            const user = await user_1.User.findByPk(userId);
            // If the user is found, set the user on the request object and call the next middleware
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
                next();
            }
            else {
                // If the user is not found, return an error response with status code 404
                return (0, utils_1.errorResponse)(res, 'User not found', 404);
            }
        }
    }
    catch (error) {
        // If the token is expired, return an error response with status code 401
        if (error['name'] === 'TokenExpiredError') {
            return (0, utils_1.errorResponse)(res, error['message'], 401);
        }
        // If there is any other error, return an error response with status code 403
        return (0, utils_1.errorResponse)(res, 'Forbidden', 403);
    }
};
exports.authenticateJWT = authenticateJWT;
