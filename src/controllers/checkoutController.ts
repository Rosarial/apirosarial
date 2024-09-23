import { Response } from 'express';
import path from 'path';
import { Checkin } from '../models/checkin';

import { AuthenticatedRequest } from '../middleware/authMiddleware';
import CheckoutDetail from '../models/checkout';
import { errorResponse, successResponse } from '../utils';
import { saveImageAndGetUrl } from '../utils/imageUtils';

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Complete checkout
 *     description: Complete checkout
 *     tags:
 *       - Checkout
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: integer
 *               checkin:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   initialCheckinDate:
 *                     type: string
 *               imageAfter:
 *                 type: object
 *                 properties:
 *                   base64Data:
 *                     type: string
 *               needRestock:
 *                 type: boolean
 *               restockProducts:
 *                 type: array
 *                 items:
 *                   type: object
 *               hasDamage:
 *                 type: boolean
 *               damageProducts:
 *                 type: array
 *                 items:
 *                   type: object
 *             required:
 *               - storeId
 *               - checkin
 *               - imageAfter
 *     responses:
 *       200:
 *         description: Checkout completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkout:
 *                   $ref: '#/components/schemas/Checkin'
 *                 message:
 *                   type: string
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Not authorized to complete checkout
 *       404:
 *         description: Check-in not found
 *       500:
 *         description: Error completing checkout
 */
export const checkout = async (req: AuthenticatedRequest, res: Response) => {
  const {
    storeId,
    checkin,
    imageAfter,
    needRestock,
    restockProducts,
    hasDamage,
    damageProducts,
  } = req.body;

  try {
    // Verify if the check-in exists and is marked as initial
    const existingCheckin = await Checkin.findOne({
      where: {
        id: checkin.id,
        storeId: storeId,
        initialCheckinDate: checkin.initialCheckinDate,
        isDone: false,
      },
    });

    if (!existingCheckin) {
      return errorResponse(res, 'Check-in not found or already completed', 404);
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    const imageAfterUrl = saveImageAndGetUrl(
      imageAfter.base64Data,
      uploadDir,
      req
    ); // Use utility function

    existingCheckin.isDone = true;
    const existingPhotos = JSON.parse(existingCheckin.photoUrls);
    existingPhotos.push({ img: imageAfterUrl, type: 'checkout' });
    existingCheckin.photoUrls = JSON.stringify(existingPhotos);
    await existingCheckin.save();

    // Process damaged products
    if (hasDamage && damageProducts && damageProducts.length > 0) {
      for (let i = 0; i < damageProducts.length; i++) {
        const damageProduct = damageProducts[i];
        const damagePhotoUrl = saveImageAndGetUrl(
          damageProduct.damagePhoto.base64Data,
          uploadDir,
          req
        );
        damageProducts[i].damagePhoto.url = damagePhotoUrl;
        // Remove base64Data after saving the URL
        delete damageProducts[i].damagePhoto.base64Data;
      }
    }

    // Save information about needing restock and damaged products (if necessary)
    if (needRestock || hasDamage) {
      const checkoutDetails = {
        storeId,
        checkinId: checkin.id,
        needRestock,
        restockProducts: JSON.stringify(restockProducts),
        hasDamage,
        damageProducts: JSON.stringify(damageProducts),
      };

      // Create a new CheckoutDetails table and insert the necessary data
      const checkoutDetail = await CheckoutDetail.create(checkoutDetails);
      // (Uncomment and implement the CheckoutDetails table as needed)
      console.log(checkoutDetail);
    }

    return successResponse(
      res,
      existingCheckin,
      'Checkout completed successfully'
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error completing checkout', 500);
  }
};

/**
 * @swagger
 * /checkout/details:
 *   get:
 *     summary: Retrieve checkout details
 *     tags:
 *       - Checkout
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: checkinId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Checkout details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkin:
 *                   $ref: '#/components/schemas/Checkin'
 *                 checkoutDetails:
 *                   $ref: '#/components/schemas/CheckoutDetail'
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing storeId or checkinId
 *       404:
 *         description: Checkin not found or already completed
 *       500:
 *         description: Error retrieving checkout details
 */
export const checkoutDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { storeId, checkinId } = req.query;

  if (!storeId || !checkinId) {
    return errorResponse(res, 'Missing storeId or checkinId', 400);
  }

  try {
    const existingCheckin = await Checkin.findOne({
      where: {
        id: checkinId,
        storeId: storeId,
        isDone: true,
      },
    });

    if (!existingCheckin) {
      return errorResponse(res, 'Checkin not found or already completed', 404);
    }

    let checkoutDetails = null;

    try {
      checkoutDetails = await CheckoutDetail.findOne({
        where: {
          checkinId: checkinId,
        },
      });
    } catch (error) {
      return errorResponse(res, 'Checkout details not found', 404);
    }

    const data = {
      ...checkoutDetails?.toJSON(),
      checkin: existingCheckin?.toJSON(),
    };

    // Converte a string de objetos JSON em objetos JavaScript
    data.checkin.photoUrls = data?.checkin?.photoUrls
      ? JSON.parse(data.checkin.photoUrls)
      : null;
    data.checkin.deviceInfo = data?.checkin?.deviceInfo
      ? JSON.parse(data.checkin.deviceInfo)
      : null;
    data.damageProducts = data?.damageProducts
      ? JSON.parse(data.damageProducts)
      : null;
    data.restockProducts = data?.restockProducts
      ? JSON.parse(data.restockProducts)
      : null;

    console.log(data);
    return successResponse(
      res,
      data,
      'Checkout details retrieved successfully'
    );
  } catch (error) {
    console.error('Error retrieving checkout details', error);
    return errorResponse(res, 'Error retrieving checkout details', 500);
  }
};
