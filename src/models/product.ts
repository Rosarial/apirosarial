import { DataTypes, Model, Sequelize } from 'sequelize';
import Checkout from './checkout';

export class Product extends Model {
  public id!: number;
  public name!: string;
  public availableQuantity!: number;

  static initModel(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        availableQuantity: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      { sequelize, modelName: 'product' }
    );
  }

  static associate() {
    Product.belongsToMany(Checkout, {
      through: 'restockProducts',
      as: 'restockedProducts',
      foreignKey: 'productId'
    });
    Product.belongsToMany(Checkout, {
      through: 'damageProducts',
      as: 'damagedProducts',
      foreignKey: 'productId'
    });
  }
}
