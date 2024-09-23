import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { jwtSecret } from '../config/jwt.config';
import { RefreshToken } from '../models/refreshToken';

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = async (user: any) => {
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({
    userId: user.id,
    token,
    expiryDate,
  });

  return token;
};

export const verifyToken = (token: string) => {
  return new Promise<JwtPayload | TokenExpiredError>((resolve, reject) => {
    const verify = jwt.verify(token, jwtSecret);
    if (verify instanceof TokenExpiredError) {
      return reject(verify);
    } else {
      return resolve(verify as JwtPayload);
    }
    // return verify as JwtPayload | TokenExpiredError;
  });
};
