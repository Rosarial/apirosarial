"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// Rota para criar um novo produto
router.post('/', productController_1.createProduct);
// Rota para listar todos os produtos
router.get('/', productController_1.getProducts);
exports.default = router;
