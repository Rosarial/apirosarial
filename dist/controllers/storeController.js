"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.updateStore = exports.getStore = exports.getFilteredStores = exports.getStores = void 0;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const sequelize_1 = require("sequelize");
const checkin_1 = require("../models/checkin");
const profile_1 = require("../models/profile");
const store_1 = require("../models/store");
const user_1 = require("../models/user");
const utils_1 = require("../utils");
const parseDateCustom_1 = require("../utils/parseDateCustom");
/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Retrieve stores based on the user's role and date range
 *     tags: [Store]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         required: false
 *         description: Date range
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       403:
 *         $ref: '#/components/responses/AccessDenied'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
const getStores = async (req, res) => {
    const { user } = req;
    const { date, filterByUser = true, currentLocation, maxDistance, } = req?.query;
    // const { startDate, endDate } = parseDateCustom(dateparams as string);
    const typedCurrentLocation = currentLocation;
    const conditionalWhere = {};
    const conditionalAttributes = [];
    let conditionalHaving;
    const maxDistanceInKm = !!maxDistance && typeof maxDistance === 'string'
        ? parseInt(maxDistance, 10) / 1000
        : 0;
    const timeZone = 'America/Sao_Paulo'; // Ajuste conforme necessário
    // Ajustar a data para UTC
    let startDate;
    let endDate;
    if (date) {
        const parsedDate = (0, date_fns_1.parseISO)(date);
        startDate = (0, date_fns_1.startOfDay)((0, date_fns_tz_1.toZonedTime)(parsedDate, timeZone));
        endDate = (0, date_fns_1.endOfDay)((0, date_fns_tz_1.toZonedTime)(parsedDate, timeZone));
        conditionalWhere.initialCheckinDate = {
            [sequelize_1.Op.gte]: startDate,
            [sequelize_1.Op.lt]: endDate,
        };
    }
    else {
        const currentDate = new Date();
        startDate = (0, date_fns_1.startOfDay)((0, date_fns_tz_1.toZonedTime)(currentDate, timeZone));
        endDate = (0, date_fns_1.endOfDay)((0, date_fns_tz_1.toZonedTime)(currentDate, timeZone));
        conditionalWhere.initialCheckinDate = {
            [sequelize_1.Op.gte]: startDate,
            [sequelize_1.Op.lt]: endDate,
        };
    }
    if (filterByUser) {
        conditionalWhere.userId = user?.id;
    }
    if (currentLocation) {
        conditionalAttributes.push([
            sequelize_1.Sequelize.literal(`(SELECT
            111.111 * DEGREES(
              ACOS(
                LEAST(
                  1.0,
                  COS(RADIANS(store.latitude)) * COS(RADIANS(${typedCurrentLocation.latitude})) * COS(RADIANS(store.longitude - ${typedCurrentLocation.longitude})) + SIN(RADIANS(store.latitude)) * SIN(RADIANS(${typedCurrentLocation.latitude}))
                )
              )
            )
          FROM stores)`),
            'distance_in_km',
        ]);
        conditionalHaving = sequelize_1.Sequelize.literal(`distance_in_km < ${maxDistanceInKm ?? 10}`);
    }
    try {
        let stores;
        if (user?.role === user_1.UserRole.PROMOTER) {
            stores = await store_1.Store.findAll({
                attributes: [
                    'id',
                    'name',
                    'promoterId',
                    'cnpj',
                    'cpf',
                    'email',
                    'address',
                    'phone',
                    'latitude',
                    'longitude',
                    'registrationDate',
                    'paymentDate',
                    'value',
                    'active',
                    'photo',
                    'createdAt',
                    'updatedAt',
                    ...conditionalAttributes,
                ],
                where: { promoterId: user.id },
                include: [
                    {
                        model: checkin_1.Checkin,
                        as: 'checkins',
                        where: conditionalWhere,
                        required: false,
                    },
                ],
                having: conditionalHaving,
            });
            const storesWithCheckin = stores.map((store) => {
                const checkin = store.checkins && store.checkins.length > 0
                    ? store.checkins[0]
                    : null;
                const storeData = store.toJSON();
                delete storeData.checkins; // Remove o campo checkins
                if (checkin) {
                    const checkinData = typeof checkin.toJSON === 'function' ? checkin.toJSON() : checkin;
                    checkinData.photoUrls = JSON.parse(checkinData.photoUrls || '[]');
                    return {
                        ...storeData,
                        checkin: checkinData,
                    };
                }
                else {
                    return {
                        ...storeData,
                        checkin: null,
                    };
                }
            });
            return (0, utils_1.successResponse)(res, storesWithCheckin, 'Stores retrieved successfully');
        }
        else if (user?.role === user_1.UserRole.SUPERVISOR ||
            user?.role === user_1.UserRole.ADMIN) {
            stores = await store_1.Store.findAll({
                include: [
                    {
                        model: checkin_1.Checkin,
                        as: 'checkins',
                        where: {
                            initialCheckinDate: {
                                [sequelize_1.Op.gte]: startDate,
                                [sequelize_1.Op.lt]: endDate,
                            },
                        },
                        include: [
                            {
                                model: user_1.User,
                                as: 'user2',
                                attributes: ['id', 'role'],
                                include: [
                                    {
                                        model: profile_1.Profile,
                                        as: 'profile',
                                        attributes: ['firstName', 'lastName'],
                                    },
                                ],
                            },
                        ],
                        required: false,
                    },
                ],
            });
            // Convert photoUrls field from string to JSON object for each checkin
            const storesWithCheckin = stores.map((store) => {
                const storeData = store.toJSON();
                storeData.checkins = storeData.checkins.map((checkin) => {
                    const checkinData = typeof checkin.toJSON === 'function' ? checkin.toJSON() : checkin;
                    checkinData.photoUrls = JSON.parse(checkinData.photoUrls || '[]');
                    return checkinData;
                });
                return storeData;
            });
            return (0, utils_1.successResponse)(res, storesWithCheckin, 'Stores retrieved successfully');
        }
        else {
            return (0, utils_1.errorResponse)(res, 'Access denied', 403);
        }
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'An error occurred while retrieving the stores', 500);
    }
};
exports.getStores = getStores;
/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Retrieve stores based on filters
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number. Default is 1
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items per page. Default is 10
 *         example: 10
 *       - in: query
 *         name: promoterName
 *         schema:
 *           type: string
 *         description: Filter by promoter name
 *         example: Paulo
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by date range
 *         example: 2022-01-01
 *       - in: query
 *         name: storeName
 *         schema:
 *           type: string
 *         description: Filter by store name
 *         example: Mercado Paulo
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Store'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       500:
 *         description: An error occurred while retrieving the stores
 */
const getFilteredStores = async (req, res) => {
    const { page = 1, pageSize = 10, promoterName, date, storeName } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const { startDate, endDate } = (0, parseDateCustom_1.parseDateCustom)(date?.toString() ?? '');
    try {
        // Filtros adicionais
        const filters = {};
        if (promoterName) {
            filters['$promoter.profile.firstName$'] = {
                [sequelize_1.Op.like]: `%${promoterName}%`,
            };
        }
        if (storeName) {
            filters['name'] = { [sequelize_1.Op.like]: `%${storeName}%` };
        }
        const stores = await store_1.Store.findAndCountAll({
            where: filters,
            include: [
                {
                    model: user_1.User,
                    as: 'promoter',
                    include: [
                        {
                            model: profile_1.Profile,
                            as: 'profile',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
                {
                    model: checkin_1.Checkin,
                    as: 'checkins',
                    where: {
                        initialCheckinDate: {
                            [sequelize_1.Op.gte]: startDate,
                            [sequelize_1.Op.lt]: endDate,
                        },
                    },
                    required: false,
                },
            ],
            offset,
            limit,
        });
        const result = {
            stores: stores.rows,
            totalPages: Math.ceil(stores.count / Number(pageSize)),
            currentPage: Number(page),
        };
        return (0, utils_1.successResponse)(res, result, 'Stores retrieved successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'An error occurred while retrieving the stores', 500);
    }
};
exports.getFilteredStores = getFilteredStores;
const getStore = async (req, res) => {
    const { id } = req.params;
    try {
        const store = await store_1.Store.findByPk(id, {
            include: [
                {
                    model: user_1.User,
                    as: 'promoter',
                    include: [
                        {
                            model: profile_1.Profile,
                            as: 'profile',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
                {
                    model: checkin_1.Checkin,
                    as: 'checkins',
                },
            ],
        });
        return (0, utils_1.successResponse)(res, store, 'Store retrieved successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'An error occurred while retrieving the store', 500);
    }
};
exports.getStore = getStore;
const updateStore = async (req, res) => {
    const { id } = req.params;
    const payloadStoreBody = req.body;
    try {
        const store = await store_1.Store.findByPk(id);
        if (!store) {
            return (0, utils_1.errorResponse)(res, 'Store not found', 404);
        }
        store.name = payloadStoreBody.name ?? store.name;
        store.cnpj = payloadStoreBody.cnpj ?? store.cnpj;
        store.cpf = payloadStoreBody.cpf ?? store.cpf;
        store.email = payloadStoreBody.email ?? store.email;
        store.address = payloadStoreBody.address ?? store.address;
        store.phone = payloadStoreBody.phone ?? store.phone;
        store.latitude = payloadStoreBody.latitude ?? store.latitude;
        store.longitude = payloadStoreBody.longitude ?? store.longitude;
        store.active = payloadStoreBody.active ?? store.active;
        store.paymentDate = payloadStoreBody.paymentDate ?? store.paymentDate;
        store.value = payloadStoreBody.value ?? store.value;
        await store.save();
        return (0, utils_1.successResponse)(res, store, 'Store updated successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'An error occurred while updating the store', 500);
    }
};
exports.updateStore = updateStore;
const create = async (req, res) => {
    const payloadStoreBody = req.body;
    try {
        const store = await store_1.Store.create({ ...payloadStoreBody, active: true });
        return (0, utils_1.successResponse)(res, store, 'Store created successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'An error occurred while creating the store', 500);
    }
};
exports.create = create;
