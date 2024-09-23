import { DataTypes, Model, Sequelize } from 'sequelize';
import Checkout from './checkout';
import { Store } from './store';
import { User } from './user';

export class Checkin extends Model {
  public id!: number;
  public userId!: number;
  public storeId!: number;
  public initialCheckinDate!: Date;
  public initialCheckin!: boolean;
  public isDone!: boolean;
  public location!: string;
  public deviceInfo!: string;
  public photoUrls!: any;

  static initModel(sequelize: Sequelize) {
    Checkin.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        storeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        initialCheckinDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        isDone: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        initialCheckin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        deviceInfo: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        photoUrls: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
      },
      { sequelize, modelName: 'checkin' }
    );
  }

  static associate() {
 
    Checkin.belongsTo(User, { as: 'user2', foreignKey: 'userId' });

    // Associação de Checkin com Store, um Checkin pertence a um Store.
    Checkin.belongsTo(Store, { as: 'store', foreignKey: 'storeId' });

    Checkin.hasOne(Checkout, { as: 'checkoutDetail', foreignKey: 'checkinId' });
  }
}
