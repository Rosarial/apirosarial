import { DataTypes, Model, Sequelize } from 'sequelize';
import { Store } from './store';
import { User } from './user';
export class PromoterStore extends Model {
  public id!: number;
  public promoterId!: number;
  public storeId!: number;
  public lastCheckinDate!: Date;

  static initModel(sequelize: Sequelize) {
    PromoterStore.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        promoterId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        storeId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        lastCheckinDate: {
          type: DataTypes.DATE,
          allowNull: false
        }
      },
      { sequelize, modelName: 'promoterStore' }
    );
  }

  static associate() {
    // PromoterStore belongs to a User who is the promoter
    PromoterStore.belongsTo(User, { foreignKey: 'promoterId', as: 'promoterUser' });

    // PromoterStore belongs to a Store
    PromoterStore.belongsTo(Store, { foreignKey: 'storeId', as: 'promoterStore' });
  }
}
