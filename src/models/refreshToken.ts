import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface IRefreshToken {
  id?: number;
  userId: number;
  token: string;
  expiryDate: Date;
}

type RefreshTokenCreationAttributes = Optional<IRefreshToken, 'id'>;

export class RefreshToken
  extends Model<IRefreshToken, RefreshTokenCreationAttributes>
  implements IRefreshToken
{
  public id!: number;
  public userId!: number;
  public token!: string;
  public expiryDate!: Date;

  static initModel(sequelize: Sequelize) {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false
        },
        expiryDate: {
          type: DataTypes.DATE,
          allowNull: false
        }
      },
      { sequelize, modelName: 'refreshToken' }
    );
  }
  static associate() {}
}
