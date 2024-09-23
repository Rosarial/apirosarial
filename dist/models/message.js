"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.MessageTypes = void 0;
const sequelize_1 = require("sequelize");
const user_1 = require("./user");
exports.MessageTypes = {
    MESSAGE: 'message',
    NOTIFICATION: 'notification',
};
class Message extends sequelize_1.Model {
    static initModel(sequelize) {
        Message.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            senderId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            receiverId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            message: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: false,
            },
            type: {
                type: sequelize_1.DataTypes.ENUM(exports.MessageTypes.MESSAGE, exports.MessageTypes.NOTIFICATION),
                allowNull: false,
                defaultValue: exports.MessageTypes.MESSAGE,
            },
        }, { sequelize, modelName: 'message' });
    }
    static associate() {
        Message.belongsTo(user_1.User, { as: 'sender', foreignKey: 'senderId' });
        Message.belongsTo(user_1.User, { as: 'receiver', foreignKey: 'receiverId' });
    }
}
exports.Message = Message;
