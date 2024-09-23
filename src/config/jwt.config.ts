export const jwtSecret = process.env.JWT_SECRET || 'secretKey';
export const jwtExpiration = '1h'; // Tempo de expiração do access token
export const jwtRefreshExpiration = '7d'; // Tempo de expiração do refresh token
