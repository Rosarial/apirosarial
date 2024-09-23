"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateJWT, storeController_1.getStores);
router.get('/', authMiddleware_1.authenticateJWT, storeController_1.getFilteredStores);
exports.default = router;
