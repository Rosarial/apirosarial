"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const sequelize_1 = require("sequelize");
const checkin_1 = require("./checkin");
const promoterStore_1 = require("./promoterStore");
const user_1 = require("./user");
class Store extends sequelize_1.Model {
    static initModel(sequelize) {
        Store.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            promoterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            cnpj: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            cpf: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            address: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            latitude: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            longitude: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            registrationDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            paymentDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            value: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: false
            },
            active: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            photo: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }
        }, { sequelize, modelName: 'store' });
    }
    static associate() {
        // Relacionamento com PromoterStore
        Store.hasMany(promoterStore_1.PromoterStore, { foreignKey: 'storeId' });
        // Relacionamento com Checkin (várias verificações em uma loja)
        Store.hasMany(checkin_1.Checkin, { foreignKey: 'storeId', as: 'checkins' });
        // Relacionamento com User (promotor da loja)
        Store.belongsTo(user_1.User, { as: 'promoter', foreignKey: 'promoterId' });
    }
}
exports.Store = Store;
