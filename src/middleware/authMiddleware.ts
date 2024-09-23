import { NextFunction, Request, Response } from 'express';
import { User, UserRole } from '../models/user';
import { errorResponse } from '../utils';
import { verifyToken } from '../utils/tokenUtils';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: UserRole };
}

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
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  // If there is no authorization header, return unauthorized
  if (!authHeader) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  // Extract the token from the authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and get the decoded payload
    const decoded = (await verifyToken(token)) as {
      id: number;
      email: string;
      role: UserRole;
    };

    if (decoded && decoded['id']) {
      const userId = decoded['id'];
      // Find the user by the decoded payload's id
      const user = await User.findByPk(userId);

      // If the user is found, set the user on the request object and call the next middleware
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
        next();
      } else {
        // If the user is not found, return an error response with status code 404
        return errorResponse(res, 'User not found', 404);
      }
    }
  } catch (error: any) {
    // If the token is expired, return an error response with status code 401
    if (error['name'] === 'TokenExpiredError') {
      return errorResponse(res, error['message'], 401);
    }
    // If there is any other error, return an error response with status code 403
    return errorResponse(res, 'Forbidden', 403);
  }
};
