"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const checkout_1 = __importDefault(require("./checkout"));
class Product extends sequelize_1.Model {
    static initModel(sequelize) {
        Product.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            availableQuantity: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            }
        }, { sequelize, modelName: 'product' });
    }
    static associate() {
        Product.belongsToMany(checkout_1.default, {
            through: 'restockProducts',
            as: 'restockedProducts',
            foreignKey: 'productId'
        });
        Product.belongsToMany(checkout_1.default, {
            through: 'damageProducts',
            as: 'damagedProducts',
            foreignKey: 'productId'
        });
    }
}
exports.Product = Product;
