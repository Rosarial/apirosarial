"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const checkinController_1 = require("../controllers/checkinController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const router = (0, express_1.Router)();
router.post('/start', authMiddleware_1.authenticateJWT, checkinController_1.startCheckin);
exports.default = router;
