"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT_DEFAULT = exports.DATABASE_URL = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mysql://andre:rds20120243@localhost:3306/andre';
exports.PORT_DEFAULT = process.env.PORT || 3000;
