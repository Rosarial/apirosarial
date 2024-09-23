"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const sequelize_1 = require("sequelize");
const user_1 = require("./user");
class Profile extends sequelize_1.Model {
    static initModel(sequelize) {
        Profile.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            firstName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            lastName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            photo: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            deviceInfo: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: true,
            },
            lastLogin: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            currentPosition: {
                type: sequelize_1.DataTypes.STRING, // Defina o tipo de dado adequado para este campo
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'profile',
        });
    }
    static associate() {
        Profile.belongsTo(user_1.User, { as: 'user2', foreignKey: 'userId' });
        // Profile.belongsTo(User, { foreignKey: 'userId' });
    }
}
exports.Profile = Profile;
