import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Response } from 'express';
import { Op, OrderItem, Sequelize } from 'sequelize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Checkin } from '../models/checkin';
import { Profile } from '../models/profile';
import { Store } from '../models/store';
import { User, UserRole } from '../models/user';
import { errorResponse, successResponse } from '../utils';
import { parseDateCustom } from '../utils/parseDateCustom';

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
export const getStores = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req;
  const { date, filterByUser, currentLocation, maxDistance } = req?.query;
  const formattedFilterByUser = filterByUser ? filterByUser === 'true' : true;
  // const { startDate, endDate } = parseDateCustom(dateparams as string);
  const typedCurrentLocation = currentLocation as {
    latitude: string;
    longitude: string;
  };
  const conditionalWhere: Record<string, unknown> = {};
  const conditionalAttributes = [];
  const conditionalOrderBy = [];
  let conditionalHaving;

  const maxDistanceInKm =
    !!maxDistance && typeof maxDistance === 'string'
      ? parseInt(maxDistance, 10) / 1000
      : 0;

  const timeZone = 'America/Sao_Paulo'; // Ajuste conforme necessário
  // Ajustar a data para UTC
  let startDate: Date;
  let endDate: Date;

  if (date) {
    const parsedDate = parseISO(date as string);
    startDate = startOfDay(toZonedTime(parsedDate, timeZone));
    endDate = endOfDay(toZonedTime(parsedDate, timeZone));
    conditionalWhere.initialCheckinDate = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };
  } else {
    const currentDate = new Date();
    startDate = startOfDay(toZonedTime(currentDate, timeZone));
    endDate = endOfDay(toZonedTime(currentDate, timeZone));
    conditionalWhere.initialCheckinDate = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };
  }

  if (formattedFilterByUser) {
    conditionalWhere.userId = user?.id;
  }
  if (currentLocation) {
    conditionalAttributes.push([
      Sequelize.literal(
        `(
          SELECT
            111.111 * DEGREES(
              ACOS(
                LEAST(
                  1.0,
                  COS(RADIANS(store.latitude)) * COS(RADIANS(${typedCurrentLocation.latitude})) * COS(RADIANS(store.longitude - ${typedCurrentLocation.longitude})) + SIN(RADIANS(store.latitude)) * SIN(RADIANS(${typedCurrentLocation.latitude}))
                )
              )
            )
          FROM
            stores
          WHERE
            stores.id = store.id
        )`
      ),
      'distance_in_km',
    ]);
    conditionalHaving = Sequelize.literal(
      `distance_in_km <= ${maxDistanceInKm ?? 10}`
    );
    conditionalOrderBy.push(['distance_in_km', 'ASC']);
  }

  try {
    let stores;

    if (user?.role === UserRole.PROMOTER) {
      stores = await Store.findAll({
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
          ...(conditionalAttributes as unknown as string[]),
        ],
        where: formattedFilterByUser ? { promoterId: user.id } : {},
        include: [
          {
            model: Checkin,
            as: 'checkins',
            where: conditionalWhere,
            required: false,
          },
        ],
        having: conditionalHaving,
        order: conditionalOrderBy as OrderItem[],
      });

      const storesWithCheckin = stores.map((store) => {
        const checkin =
          store.checkins && store.checkins.length > 0
            ? store.checkins[0]
            : null;
        const storeData = store.toJSON();
        delete storeData.checkins; // Remove o campo checkins

        if (checkin) {
          const checkinData =
            typeof checkin.toJSON === 'function' ? checkin.toJSON() : checkin;
          checkinData.photoUrls = JSON.parse(checkinData.photoUrls || '[]');
          return {
            ...storeData,
            checkin: checkinData,
          };
        } else {
          return {
            ...storeData,
            checkin: null,
          };
        }
      });

      return successResponse(
        res,
        storesWithCheckin,
        'Stores retrieved successfully'
      );
    } else if (
      user?.role === UserRole.SUPERVISOR ||
      user?.role === UserRole.ADMIN
    ) {
      stores = await Store.findAll({
        include: [
          {
            model: Checkin,
            as: 'checkins',
            where: {
              initialCheckinDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
              },
            },
            include: [
              {
                model: User,
                as: 'user2',
                attributes: ['id', 'role'],
                include: [
                  {
                    model: Profile,
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
        storeData.checkins = storeData.checkins.map(
          (checkin: { toJSON: () => any }) => {
            const checkinData =
              typeof checkin.toJSON === 'function' ? checkin.toJSON() : checkin;
            checkinData.photoUrls = JSON.parse(checkinData.photoUrls || '[]');
            return checkinData;
          }
        );
        return storeData;
      });

      return successResponse(
        res,
        storesWithCheckin,
        'Stores retrieved successfully'
      );
    } else {
      return errorResponse(res, 'Access denied', 403);
    }
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      'An error occurred while retrieving the stores',
      500
    );
  }
};

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
export const getFilteredStores = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { page = 1, pageSize = 10, promoterName, date, storeName } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { startDate, endDate } = parseDateCustom(date?.toString() ?? '');

  try {
    // Filtros adicionais
    const filters: any = {};

    if (promoterName) {
      filters['$promoter.profile.firstName$'] = {
        [Op.like]: `%${promoterName}%`,
      };
    }

    if (storeName) {
      filters['name'] = { [Op.like]: `%${storeName}%` };
    }

    const stores = await Store.findAndCountAll({
      where: filters,
      include: [
        {
          model: User,
          as: 'promoter',
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
        {
          model: Checkin,
          as: 'checkins',
          where: {
            initialCheckinDate: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
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

    return successResponse(res, result, 'Stores retrieved successfully');
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      'An error occurred while retrieving the stores',
      500
    );
  }
};

export const getStore = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: 'promoter',
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
        {
          model: Checkin,
          as: 'checkins',
        },
      ],
    });
    return successResponse(res, store, 'Store retrieved successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'An error occurred while retrieving the store',
      500
    );
  }
};

export const updateStore = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const payloadStoreBody = req.body as IStore;
  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return errorResponse(res, 'Store not found', 404);
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
    return successResponse(res, store, 'Store updated successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'An error occurred while updating the store',
      500
    );
  }
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  const payloadStoreBody = req.body as IStore;
  try {
    const store = await Store.create({ ...payloadStoreBody, active: true });
    return successResponse(res, store, 'Store created successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'An error occurred while creating the store',
      500
    );
  }
};

export interface IStore {
  name: string;
  cnpj: string;
  cpf: string;
  email: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
  paymentDate: Date;
  value: number;
  active: string;
  photo: string;
}
