"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutDetails = exports.checkout = void 0;
const path_1 = __importDefault(require("path"));
const checkin_1 = require("../models/checkin");
const checkout_1 = __importDefault(require("../models/checkout"));
const utils_1 = require("../utils");
const imageUtils_1 = require("../utils/imageUtils");
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
const checkout = async (req, res) => {
    const { storeId, checkin, imageAfter, needRestock, restockProducts, hasDamage, damageProducts, } = req.body;
    try {
        // Verify if the check-in exists and is marked as initial
        const existingCheckin = await checkin_1.Checkin.findOne({
            where: {
                id: checkin.id,
                storeId: storeId,
                initialCheckinDate: checkin.initialCheckinDate,
                isDone: false,
            },
        });
        if (!existingCheckin) {
            return (0, utils_1.errorResponse)(res, 'Check-in not found or already completed', 404);
        }
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        const imageAfterUrl = (0, imageUtils_1.saveImageAndGetUrl)(imageAfter.base64Data, uploadDir, req); // Use utility function
        existingCheckin.isDone = true;
        const existingPhotos = JSON.parse(existingCheckin.photoUrls);
        existingPhotos.push({ img: imageAfterUrl, type: 'checkout' });
        existingCheckin.photoUrls = JSON.stringify(existingPhotos);
        await existingCheckin.save();
        // Process damaged products
        if (hasDamage && damageProducts && damageProducts.length > 0) {
            for (let i = 0; i < damageProducts.length; i++) {
                const damageProduct = damageProducts[i];
                const damagePhotoUrl = (0, imageUtils_1.saveImageAndGetUrl)(damageProduct.damagePhoto.base64Data, uploadDir, req);
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
            const checkoutDetail = await checkout_1.default.create(checkoutDetails);
            // (Uncomment and implement the CheckoutDetails table as needed)
            console.log(checkoutDetail);
        }
        return (0, utils_1.successResponse)(res, existingCheckin, 'Checkout completed successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error completing checkout', 500);
    }
};
exports.checkout = checkout;
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
const checkoutDetails = async (req, res) => {
    const { storeId, checkinId } = req.query;
    if (!storeId || !checkinId) {
        return (0, utils_1.errorResponse)(res, 'Missing storeId or checkinId', 400);
    }
    try {
        const existingCheckin = await checkin_1.Checkin.findOne({
            where: {
                id: checkinId,
                storeId: storeId,
                isDone: true,
            },
        });
        if (!existingCheckin) {
            return (0, utils_1.errorResponse)(res, 'Checkin not found or already completed', 404);
        }
        let checkoutDetails = null;
        try {
            checkoutDetails = await checkout_1.default.findOne({
                where: {
                    checkinId: checkinId,
                },
            });
        }
        catch (error) {
            return (0, utils_1.errorResponse)(res, 'Checkout details not found', 404);
        }
        const data = {
            ...checkoutDetails?.toJSON(),
            checkin: existingCheckin?.toJSON(),
        };
        // Converte a string de objetos JSON em objetos JavaScript
        data.checkin.photoUrls = JSON.parse(data.checkin.photoUrls);
        data.checkin.deviceInfo = JSON.parse(data.checkin.deviceInfo);
        data.damageProducts = JSON.parse(data.damageProducts);
        data.restockProducts = JSON.parse(data.restockProducts);
        console.log(data);
        return (0, utils_1.successResponse)(res, data, 'Checkout details retrieved successfully');
    }
    catch (error) {
        console.error('Error retrieving checkout details', error);
        return (0, utils_1.errorResponse)(res, 'Error retrieving checkout details', 500);
    }
};
exports.checkoutDetails = checkoutDetails;
