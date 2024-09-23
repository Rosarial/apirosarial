import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/productController';

const router = Router();

// Rota para criar um novo produto
router.post('/', createProduct);

// Rota para listar todos os produtos
router.get('/', getProducts);

export default router;
