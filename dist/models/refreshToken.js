"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const sequelize_1 = require("sequelize");
class RefreshToken extends sequelize_1.Model {
    static initModel(sequelize) {
        RefreshToken.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            token: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            expiryDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        }, { sequelize, modelName: 'refreshToken' });
    }
    static associate() { }
}
exports.RefreshToken = RefreshToken;
