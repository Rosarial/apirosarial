import { Sequelize } from 'sequelize';
import { Checkin } from './checkin';
import { Store } from './store';
import { User } from './user';

import dotevnt from 'dotenv';
import Checkout from './checkout';
import { Product } from './product';
import { Profile } from './profile';
import { PromoterStore } from './promoterStore';
import { RefreshToken } from './refreshToken';
import { Message } from './message';
dotevnt.config();

const dataBaseUrl = process.env.DATABASE_URL || '';
const sequelize = new Sequelize(dataBaseUrl, {
  dialect: 'mysql',
});
User.initModel(sequelize);
Profile.initModel(sequelize);
Store.initModel(sequelize);
Checkin.initModel(sequelize);
PromoterStore.initModel(sequelize);
RefreshToken.initModel(sequelize);
Checkout.initModel(sequelize);
Product.initModel(sequelize);
Message.initModel(sequelize);

User.associate();
Profile.associate();
Store.associate();
Checkin.associate();
PromoterStore.associate();
RefreshToken.associate();
Checkout.associate();
Product.associate();
Message.associate();

export { Checkin, Checkout, Product, Profile, Store, User, Message, sequelize };

// Remova a função de sincronização após usá-la apenas uma vez para criar o esquema inicial
async function syncDatabase() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  }
}
// syncDatabase();
