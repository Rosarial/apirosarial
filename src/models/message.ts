import { DataTypes, Model, Sequelize } from 'sequelize';
import { User } from './user';

export const MessageTypes = {
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
};
export class Message extends Model {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public message!: number;
  public createdAt: string | undefined;

  static initModel(sequelize: Sequelize) {
    Message.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        senderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        receiverId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM(MessageTypes.MESSAGE, MessageTypes.NOTIFICATION),
          allowNull: false,
          defaultValue: MessageTypes.MESSAGE,
        },
      },
      { sequelize, modelName: 'message' }
    );
  }

  static associate() {
    Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
    Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
  }
}
