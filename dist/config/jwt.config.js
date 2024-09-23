"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtRefreshExpiration = exports.jwtExpiration = exports.jwtSecret = void 0;
exports.jwtSecret = process.env.JWT_SECRET || 'secretKey';
exports.jwtExpiration = '365d'; // Tempo de expiração do access token
exports.jwtRefreshExpiration = '7d'; // Tempo de expiração do refresh token
