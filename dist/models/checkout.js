"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutDetail = void 0;
const sequelize_1 = require("sequelize");
class CheckoutDetail extends sequelize_1.Model {
    static initModel(sequelize) {
        CheckoutDetail.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            storeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            checkinId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            needRestock: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
            restockProducts: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
            hasDamage: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
            damageProducts: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
            damageImage: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
        }, { sequelize, modelName: 'checkoutDetail' });
    }
    static associate() { }
}
exports.CheckoutDetail = CheckoutDetail;
exports.default = CheckoutDetail;
