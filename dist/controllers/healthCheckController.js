"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = void 0;
const utils_1 = require("../utils");
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
const ping = (req, res) => {
    const date = new Date();
    return (0, utils_1.successResponse)(res, date, '!Pong');
};
exports.ping = ping;
