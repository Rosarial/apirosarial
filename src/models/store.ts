import { DataTypes, Model, Sequelize } from 'sequelize';
import { Checkin } from './checkin';
import { PromoterStore } from './promoterStore';
import { User } from './user';

export class Store extends Model {
  public id!: number;
  public name!: string;
  public promoterId!: number;
  public cnpj!: string;
  public cpf!: string;
  public email!: string;
  public address!: string;
  public phone!: string;
  public latitude!: string;
  public longitude!: string;
  public registrationDate!: Date;
  public paymentDate!: Date;
  public value!: number;
  public active!: string;
  public photo!: string;
  public checkins?: Checkin[];

  static initModel(sequelize: Sequelize) {
    Store.init(
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
        promoterId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        cnpj: {
          type: DataTypes.STRING,
          allowNull: false
        },
        cpf: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false
        },
        latitude: {
          type: DataTypes.STRING,
          allowNull: false
        },
        longitude: {
          type: DataTypes.STRING,
          allowNull: false
        },
        registrationDate: {
          type: DataTypes.DATE,
          allowNull: false
        },
        paymentDate: {
          type: DataTypes.DATE,
          allowNull: false
        },
        value: {
          type: DataTypes.FLOAT,
          allowNull: false
        },
        active: {
          type: DataTypes.STRING,
          allowNull: false
        },
        photo: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      { sequelize, modelName: 'store' }
    );
  }

  static associate() {
    // Relacionamento com PromoterStore
  Store.hasMany(PromoterStore, { foreignKey: 'storeId' });
  // Relacionamento com Checkin (várias verificações em uma loja)
  Store.hasMany(Checkin, { foreignKey: 'storeId', as: 'checkins' });
  // Relacionamento com User (promotor da loja)
  Store.belongsTo(User, { as: 'promoter', foreignKey: 'promoterId' });

  }
}
