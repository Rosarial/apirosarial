"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
const refreshToken_1 = require("../models/refreshToken");
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, jwt_config_1.jwtSecret, { expiresIn: '1h' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (user) => {
    const token = jsonwebtoken_1.default.sign({ id: user.id }, jwt_config_1.jwtSecret, { expiresIn: '7d' });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await refreshToken_1.RefreshToken.create({
        userId: user.id,
        token,
        expiryDate,
    });
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        const verify = jsonwebtoken_1.default.verify(token, jwt_config_1.jwtSecret);
        if (verify instanceof jsonwebtoken_1.TokenExpiredError) {
            return reject(verify);
        }
        else {
            return resolve(verify);
        }
        // return verify as JwtPayload | TokenExpiredError;
    });
};
exports.verifyToken = verifyToken;
