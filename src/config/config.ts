import dotenv from 'dotenv';
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mysql://u940267718_rosariall:Lo110720@193.203.166.107:3306/u940267718_rosariall';
export const PORT_DEFAULT = process.env.PORT || 3000;
