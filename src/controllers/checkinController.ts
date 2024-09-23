import { Response } from 'express';
import path from 'path';
import { Op } from 'sequelize';

import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Checkin } from '../models/checkin';
import { Store } from '../models/store';
import { errorResponse, successResponse } from '../utils';
import { saveImageAndGetUrl } from '../utils/imageUtils';
import { parseDateCustom } from '../utils/parseDateCustom';

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
export const startCheckin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    userID,
    clientID,
    timestamp,
    imageCheckin,
    deviceInfo,
    initialCheckin,
  } = req.body;

  const { startDate: startOfDayUTC, endDate: endOfDayUTC } =
    parseDateCustom(timestamp);

  try {
    const store = await Store.findByPk(clientID);

    if (!store) {
      return errorResponse(res, 'Store not found', 404);
    }

    const existingCheckin = await Checkin.findOne({
      where: {
        userId: userID,
        storeId: clientID,
        initialCheckinDate: {
          [Op.gte]: startOfDayUTC,
          [Op.lt]: endOfDayUTC,
        },
      },
    });

    const uploadDir = path.join(__dirname, '../../uploads');
    const imageUrl = saveImageAndGetUrl(
      imageCheckin.base64Data,
      uploadDir,
      req
    );

    if (existingCheckin) {
      existingCheckin.deviceInfo = JSON.stringify(deviceInfo);
      existingCheckin.photoUrls = JSON.stringify([
        { img: imageUrl, type: 'checkin' },
      ]);
      existingCheckin.initialCheckin = initialCheckin;
      existingCheckin.isDone = false;
      await existingCheckin.save();

      return successResponse(
        res,
        existingCheckin,
        'Check-in updated successfully'
      );
    } else {
      const newCheckin = await Checkin.create({
        userId: userID,
        storeId: clientID,
        initialCheckinDate: timestamp,
        isDone: false,
        initialCheckin: initialCheckin,
        deviceInfo: JSON.stringify(deviceInfo),
        photoUrls: JSON.stringify([{ img: imageUrl, type: 'checkin' }]),
      });

      return successResponse(res, newCheckin, 'Check-in started successfully');
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error starting check-in', 500);
  }
};

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

export const updateCheckin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { checkinId, location, deviceInfo } = req.body;
  const user = req.user;

  if (!user) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  try {
    const checkin = await Checkin.findByPk(checkinId);
    if (!checkin) {
      return errorResponse(res, 'Check-in not found', 404);
    }

    if (checkin.userId !== user.id) {
      return errorResponse(res, 'Not authorized to update this check-in', 403);
    }

    checkin.location = location;
    checkin.deviceInfo = JSON.parse(deviceInfo); // Convertendo deviceInfo para objeto

    await checkin.save();

    return successResponse(res, checkin, 'Check-in updated successfully');
  } catch (error) {
    return errorResponse(res, 'Error updating check-in', 500);
  }
};
