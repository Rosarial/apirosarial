import { Request, Response } from 'express';
import { successResponse } from '../utils';

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Health check
 *     tags: [Health check]
 *     responses:
 *       200:
 *         description: Ping response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: !Pong
 */
export const ping = (req: Request, res: Response) => {
  const date = new Date();
  return successResponse(res, date, '!Pong');
};
