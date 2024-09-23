"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoterStore = void 0;
const sequelize_1 = require("sequelize");
const store_1 = require("./store");
const user_1 = require("./user");
class PromoterStore extends sequelize_1.Model {
    static initModel(sequelize) {
        PromoterStore.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            promoterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            storeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            lastCheckinDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        }, { sequelize, modelName: 'promoterStore' });
    }
    static associate() {
        // PromoterStore belongs to a User who is the promoter
        PromoterStore.belongsTo(user_1.User, { foreignKey: 'promoterId', as: 'promoterUser' });
        // PromoterStore belongs to a Store
        PromoterStore.belongsTo(store_1.Store, { foreignKey: 'storeId', as: 'promoterStore' });
    }
}
exports.PromoterStore = PromoterStore;
