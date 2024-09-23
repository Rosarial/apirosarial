import { DataTypes, Model, Sequelize } from 'sequelize';

export class CheckoutDetail extends Model {
  public id!: number;
  public storeId!: number;
  public checkinId!: number;
  public needRestock!: boolean;
  public restockProducts!: string;
  public hasDamage!: boolean;
  public damageProducts!: string;
  public damageImage!: string;

  static initModel(sequelize: Sequelize) {
    CheckoutDetail.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        storeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        checkinId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        needRestock: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        restockProducts: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        hasDamage: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        damageProducts: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        damageImage: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
      },
      { sequelize, modelName: 'checkoutDetail' }
    );
  }
  static associate() {}
}

export default CheckoutDetail;
