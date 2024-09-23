import { DataTypes, Model, Sequelize } from 'sequelize';
import { User, UserRole } from './user';
export interface IProfile {
  id?: number;
  userId?: number;
  email: string;
  role: UserRole;
  active: boolean;
  name?: string; // Adicionando o campo
  lastName?: string; // Adicionando o campo
  firstName?: string; // Adicionando o campo
  fullName?: string;
  photo?: string; // Adicionando o campo photo
  createdAt?: Date;
  updatedAt?: Date;
  deviceInfo?: object;
  lastLogin?: Date;
}

export class Profile extends Model {
  public role!: UserRole;
  public active!: boolean;
  public lastName!: string;
  public firstName!: string;
  public fullName!: string;
  public id!: number;
  public address!: string;
  public phone!: string;
  public photo!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public email!: string;
  public deviceInfo?: any;
  public lastLogin!: Date;
  public currentPosition!: string; // Adicione este campo se não existir

  static initModel(sequelize: Sequelize) {
    Profile.init(
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
        firstName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        photo: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        deviceInfo: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        currentPosition: {
          type: DataTypes.STRING, // Defina o tipo de dado adequado para este campo
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'profile',
      }
    );
  }

  static associate() {
    Profile.belongsTo(User, { as: 'user2', foreignKey: 'userId' });

    // Profile.belongsTo(User, { foreignKey: 'userId' });
  }
}
