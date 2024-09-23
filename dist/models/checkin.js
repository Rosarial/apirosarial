"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkin = void 0;
const sequelize_1 = require("sequelize");
const checkout_1 = __importDefault(require("./checkout"));
const store_1 = require("./store");
const user_1 = require("./user");
class Checkin extends sequelize_1.Model {
    static initModel(sequelize) {
        Checkin.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            storeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            initialCheckinDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            isDone: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
            initialCheckin: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
            location: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            deviceInfo: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
            photoUrls: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
        }, { sequelize, modelName: 'checkin' });
    }
    static associate() {
        Checkin.belongsTo(user_1.User, { as: 'user2', foreignKey: 'userId' });
        // Associação de Checkin com Store, um Checkin pertence a um Store.
        Checkin.belongsTo(store_1.Store, { as: 'store', foreignKey: 'storeId' });
        Checkin.hasOne(checkout_1.default, { as: 'checkoutDetail', foreignKey: 'checkinId' });
    }
}
exports.Checkin = Checkin;
