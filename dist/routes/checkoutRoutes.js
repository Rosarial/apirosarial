"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkoutController_1 = require("../controllers/checkoutController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// checkout
router.post('/', authMiddleware_1.authenticateJWT, checkoutController_1.checkout);
router.get('/details', authMiddleware_1.authenticateJWT, checkoutController_1.checkoutDetails);
exports.default = router;
