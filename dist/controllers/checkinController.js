"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCheckin = exports.startCheckin = void 0;
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const checkin_1 = require("../models/checkin");
const store_1 = require("../models/store");
const utils_1 = require("../utils");
const imageUtils_1 = require("../utils/imageUtils");
const parseDateCustom_1 = require("../utils/parseDateCustom");
/**
 * @swagger
 * /api/checkin/start:
 *   post:
 *     summary: Start a check-in
 *     tags: [Checkin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               clientID:
 *                 type: string
 *               timestamp:
 *                 type: string
 *               imageCheckin:
 *                 type: object
 *                 properties:
 *                   base64Data:
 *                     type: string
 *               deviceInfo:
 *                 type: object
 *               initialCheckin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Check-in started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkin'
 *       404:
 *         description: Store not found
 *       500:
 *         description: Error starting check-in
 */
const startCheckin = async (req, res) => {
    const { userID, clientID, timestamp, imageCheckin, deviceInfo, initialCheckin, } = req.body;
    const { startDate: startOfDayUTC, endDate: endOfDayUTC } = (0, parseDateCustom_1.parseDateCustom)(timestamp);
    try {
        const store = await store_1.Store.findByPk(clientID);
        if (!store) {
            return (0, utils_1.errorResponse)(res, 'Store not found', 404);
        }
        const existingCheckin = await checkin_1.Checkin.findOne({
            where: {
                userId: userID,
                storeId: clientID,
                initialCheckinDate: {
                    [sequelize_1.Op.gte]: startOfDayUTC,
                    [sequelize_1.Op.lt]: endOfDayUTC,
                },
            },
        });
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        const imageUrl = (0, imageUtils_1.saveImageAndGetUrl)(imageCheckin.base64Data, uploadDir, req);
        if (existingCheckin) {
            existingCheckin.deviceInfo = JSON.stringify(deviceInfo);
            existingCheckin.photoUrls = JSON.stringify([
                { img: imageUrl, type: 'checkin' },
            ]);
            existingCheckin.initialCheckin = initialCheckin;
            existingCheckin.isDone = false;
            await existingCheckin.save();
            return (0, utils_1.successResponse)(res, existingCheckin, 'Check-in updated successfully');
        }
        else {
            const newCheckin = await checkin_1.Checkin.create({
                userId: userID,
                storeId: clientID,
                initialCheckinDate: timestamp,
                isDone: false,
                initialCheckin: initialCheckin,
                deviceInfo: JSON.stringify(deviceInfo),
                photoUrls: JSON.stringify([{ img: imageUrl, type: 'checkin' }]),
            });
            return (0, utils_1.successResponse)(res, newCheckin, 'Check-in started successfully');
        }
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error starting check-in', 500);
    }
};
exports.startCheckin = startCheckin;
/**
 * @swagger
 * /checkin/{checkinId}:
 *   put:
 *     summary: Update check-in
 *     description: Update check-in
 *     tags:
 *       - Checkin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkinId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: body
 *         name: checkin
 *         schema:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *             deviceInfo:
 *               type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Check-in updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkin:
 *                   $ref: '#/components/schemas/Checkin'
 *                 message:
 *                   type: string
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Not authorized to update this check-in
 *       404:
 *         description: Check-in not found
 *       500:
 *         description: Error updating check-in
 */
const updateCheckin = async (req, res) => {
    const { checkinId, location, deviceInfo } = req.body;
    const user = req.user;
    if (!user) {
        return (0, utils_1.errorResponse)(res, 'User not authenticated', 401);
    }
    try {
        const checkin = await checkin_1.Checkin.findByPk(checkinId);
        if (!checkin) {
            return (0, utils_1.errorResponse)(res, 'Check-in not found', 404);
        }
        if (checkin.userId !== user.id) {
            return (0, utils_1.errorResponse)(res, 'Not authorized to update this check-in', 403);
        }
        checkin.location = location;
        checkin.deviceInfo = JSON.parse(deviceInfo); // Convertendo deviceInfo para objeto
        await checkin.save();
        return (0, utils_1.successResponse)(res, checkin, 'Check-in updated successfully');
    }
    catch (error) {
        return (0, utils_1.errorResponse)(res, 'Error updating check-in', 500);
    }
};
exports.updateCheckin = updateCheckin;
