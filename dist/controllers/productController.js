"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.getProducts = exports.createProduct = void 0;
const product_1 = require("../models/product");
const utils_1 = require("../utils");
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
const createProduct = async (req, res) => {
    const { name, availableQuantity } = req.body;
    try {
        const product = await product_1.Product.create({ name, availableQuantity });
        return (0, utils_1.successResponse)(res, product, 'Product created successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error creating product', 500);
    }
};
exports.createProduct = createProduct;
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
const getProducts = async (req, res) => {
    try {
        const products = await product_1.Product.findAll();
        return (0, utils_1.successResponse)(res, products, 'Products retrieved successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error retrieving products', 500);
    }
};
exports.getProducts = getProducts;
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
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, availableQuantity } = req.body;
    try {
        const product = await product_1.Product.findByPk(id);
        if (!product) {
            return (0, utils_1.errorResponse)(res, 'Product not found', 404);
        }
        product.name = name || product.name;
        product.availableQuantity = availableQuantity || product.availableQuantity;
        await product.save();
        return (0, utils_1.successResponse)(res, product, 'Product updated successfully');
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.errorResponse)(res, 'Error updating product', 500);
    }
};
exports.updateProduct = updateProduct;
