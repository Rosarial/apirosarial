"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.Message = exports.User = exports.Store = exports.Profile = exports.Product = exports.Checkout = exports.Checkin = void 0;
const sequelize_1 = require("sequelize");
const checkin_1 = require("./checkin");
Object.defineProperty(exports, "Checkin", { enumerable: true, get: function () { return checkin_1.Checkin; } });
const store_1 = require("./store");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return store_1.Store; } });
const user_1 = require("./user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
const dotenv_1 = __importDefault(require("dotenv"));
const checkout_1 = __importDefault(require("./checkout"));
exports.Checkout = checkout_1.default;
const product_1 = require("./product");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return product_1.Product; } });
const profile_1 = require("./profile");
Object.defineProperty(exports, "Profile", { enumerable: true, get: function () { return profile_1.Profile; } });
const promoterStore_1 = require("./promoterStore");
const refreshToken_1 = require("./refreshToken");
const message_1 = require("./message");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return message_1.Message; } });
dotenv_1.default.config();
const dataBaseUrl = process.env.DATABASE_URL || '';
const sequelize = new sequelize_1.Sequelize(dataBaseUrl, {
    dialect: 'mysql',
});
exports.sequelize = sequelize;
user_1.User.initModel(sequelize);
profile_1.Profile.initModel(sequelize);
store_1.Store.initModel(sequelize);
checkin_1.Checkin.initModel(sequelize);
promoterStore_1.PromoterStore.initModel(sequelize);
refreshToken_1.RefreshToken.initModel(sequelize);
checkout_1.default.initModel(sequelize);
product_1.Product.initModel(sequelize);
message_1.Message.initModel(sequelize);
user_1.User.associate();
profile_1.Profile.associate();
store_1.Store.associate();
checkin_1.Checkin.associate();
promoterStore_1.PromoterStore.associate();
refreshToken_1.RefreshToken.associate();
checkout_1.default.associate();
product_1.Product.associate();
message_1.Message.associate();
// Remova a função de sincronização após usá-la apenas uma vez para criar o esquema inicial
async function syncDatabase() {
    try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database synchronized successfully.');
    }
    catch (error) {
        console.error('Unable to synchronize the database:', error);
    }
}
// syncDatabase();
