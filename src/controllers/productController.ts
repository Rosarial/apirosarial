import { Request, Response } from 'express';
import { Product } from '../models/product';
import { errorResponse, successResponse } from '../utils';

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do produto
 *               availableQuantity:
 *                 type: integer
 *                 description: Quantidade disponível do produto
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro no servidor
 */
export const createProduct = async (req: Request, res: Response) => {
  const { name, availableQuantity } = req.body;

  try {
    const product = await Product.create({ name, availableQuantity });
    return successResponse(res, product, 'Product created successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error creating product', 500);
  }
};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error retrieving products
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    return successResponse(res, products, 'Products retrieved successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error retrieving products', 500);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               availableQuantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 availableQuantity:
 *                   type: integer
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error updating product
 */
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, availableQuantity } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    product.name = name || product.name;
    product.availableQuantity = availableQuantity || product.availableQuantity;

    await product.save();

    return successResponse(res, product, 'Product updated successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Error updating product', 500);
  }
};
