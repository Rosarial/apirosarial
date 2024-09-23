import dotenv from 'dotenv';
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
export const DATABASE_URL =
  process.env.DATABASE_URL || 'mysql://andre:rds20120243@localhost:3306/andre';
export const PORT_DEFAULT = process.env.PORT || 3000;
