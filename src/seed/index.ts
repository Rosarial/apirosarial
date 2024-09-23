import bcrypt from 'bcryptjs';
import { Product, sequelize } from '../models';
import { User, UserRole } from '../models/user';
import { seedStores } from './store.fake';
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

const seedDatabase = async () => {
  // syncDatabase();
  // await sequelize.sync({ force: true }); // Isso irá recriar o banco de dados

  // Cria as senhas dos usuários
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedAdminPassword2 = await bcrypt.hash('abc123dfg456', 10);
  const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 10);
  const hashedPromoterPassword = await bcrypt.hash('promoter123', 10);
  const hashedPromoterPassword2 = await bcrypt.hash('promoter123', 10);

  // Cria um usuário supervisor
  const supervisor = await User.create({
    email: 'supervisor@example.com',
    password: hashedSupervisorPassword,
    role: UserRole.SUPERVISOR,
    active: true,
    accountType: 1,
    creationTimestamp: new Date(),
    failedLogins: 0,
    hasAvatar: false,
    userName: 'Supervisor',
  });

  // Cria usuários admin
  const admin = await User.create({
    email: 'admin@example.com',
    password: hashedAdminPassword,
    role: UserRole.ADMIN,
    active: true,
    accountType: 1,
    creationTimestamp: new Date(),
    failedLogins: 0,
    hasAvatar: false,
    userName: 'Admin',
  });

  const admin2 = await User.create({
    email: 'admin@gmail.com',
    password: hashedAdminPassword2,
    role: UserRole.ADMIN,
    active: true,
    accountType: 1,
    creationTimestamp: new Date(),
    failedLogins: 0,
    hasAvatar: false,
    userName: 'Admin 2',
  });

  // Cria usuários promotores

  // const promoter = await User.create({
  //   email: 'promoter@example.com',
  //   password: hashedPromoterPassword,
  //   role: UserRole.PROMOTER,
  //   active: true,
  // });
  // promotores.push(promoter);
  // const promoter2 = await User.create({
  //   email: 'promoter2@example.com',
  //   password: hashedPromoterPassword2,
  //   role: UserRole.PROMOTER,
  //   active: true,
  // });
  const promotores = [];
  const numPromoters = 10; // Defina o número de promotores que deseja criar

  for (let i = 0; i < numPromoters; i++) {
    const promoter = await User.create({
      email: `promoter${i + 1}@example.com`,
      password: hashedPromoterPassword,
      role: UserRole.PROMOTER,
      active: true,
      accountType: 1,
      creationTimestamp: new Date(),
      failedLogins: 0,
      hasAvatar: false,
      userName: `Promotor ${i + 1}`,
    });
    promotores.push({ id: promoter.id, name: promoter.email });
  }
  // Cria algumas lojas associadas aos promotores
  try {
    await seedStores(promotores);
  } catch (error) {
    console.log('Erro ao popular a base de dados Lojas/store:', error);
  }

  /*await Store.bulkCreate([
    {
      promoterId: promoter2.id,
      name: 'atacadista',
      phone: '(11) 11111-1111',
      email: 'empresa1@hotmail.com',
      cpf: '111.111.111-11',
      cnpj: '11.111.111/1111-11',
      active: 'Sim',
      registrationDate: '2022-12-19',
      paymentDate: '2022-09-25',
      value: '250.00',
      address: 'rua Dr Jose Osorio Oliveira Azevedo',
      latitude: '-47.126028',
      longitude: '-23.517607',
    },
    {
      promoterId: promoter.id,
      name: 'assai',
      phone: '(11) 99342-4754',
      email: 'assai@gmail.com',
      cpf: '726.838.768-77',
      cnpj: '89.787.575/4567-56',
      active: 'Sim',
      registrationDate: '2023-04-06',
      paymentDate: '2023-02-19',
      value: '270.00',
      address: '701 W Oakland Avenue',
      latitude: '-47.20046862900332',

      longitude: '-23.566223072906368',
    },
    {
      promoterId: promoter2.id,
      name: 'carrefour',
      phone: '',
      email: 'empresa123@galaxy.com',
      cpf: '213.425.534-32',
      cnpj: '23.458.492/3048-54',
      active: 'Sim',
      registrationDate: '2023-04-06',
      paymentDate: '2023-03-13',
      value: '400.00',
      address: 'internacional drive',
      latitude: -19.1616,
      longitude: -40.770967,
    },
    {
      promoterId: promoter.id,
      name: 'Mercearia Paião',
      phone: '(27)090801312',
      email: 'empresa123@galaxy.com',
      cpf: '213.425.534-32',
      cnpj: '23.458.492/3048-54',
      active: 'Sim',
      registrationDate: '2023-04-06',
      paymentDate: '2023-03-13',
      value: '400.00',
      address: 'internacional drive',
      latitude: -19.1616,
      longitude: -40.770967,
    },
  ]);*/
  const products = [
    { name: 'Produto 1', availableQuantity: 100 },
    { name: 'Produto 2', availableQuantity: 200 },
    { name: 'Produto 3', availableQuantity: 300 },
    { name: 'Produto 4', availableQuantity: 400 },
    { name: 'Produto 5', availableQuantity: 500 },

    { name: 'Produto 6', availableQuantity: 500 },
    { name: 'Produto 7', availableQuantity: 500 },
    { name: 'Produto 8', availableQuantity: 500 },
  ];

  await Product.bulkCreate(products);
  console.log('Base de dados populada com sucesso.');
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error('Erro ao popular a base de dados:', error);
  process.exit(1);
});

// const seedDatabase = async () => {
//   await sequelize.sync({ force: true }); // Isso irá recriar o banco de dados

//   // Cria um usuário admin
//   const hashedAdminPassword = await bcrypt.hash('admin123', 10);
//   const hashedAdminPassword2 = await bcrypt.hash('abc123dfg456', 10);

//   const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 10);

//   const supervisor = await User.create({
//     email: 'supervisor@example.com',
//     password: hashedSupervisorPassword,
//     role: UserRole.SUPERVISOR,
//     active: true
//   });

//   const admin = await User.create({
//     email: 'admin@example.com',
//     password: hashedAdminPassword,
//     role: UserRole.ADMIN,
//     active: true
//   });

//   const admin2 = await User.create({
//     email: 'admin@gmail.com',
//     password: hashedAdminPassword2,
//     role: UserRole.ADMIN,
//     active: true
//   });

//   // Cria um usuário promotor
//   const hashedPromoterPassword = await bcrypt.hash('promoter123', 10);
//   const promoter = await User.create({
//     email: 'promoter@example.com',
//     password: hashedPromoterPassword,
//     role: UserRole.PROMOTER,
//     active: true
//   });

//   // Cria um usuário promotor
//   const hashedPromoterPassword2 = await bcrypt.hash('promoter123', 10);
//   const promoter2 = await User.create({
//     email: 'promoter2@example.com',
//     password: hashedPromoterPassword,
//     role: UserRole.PROMOTER,
//     active: true
//   });

//   // Cria algumas lojas associadas ao promotor
//   await Store.bulkCreate([
//     {
//       promoterId: promoter2.id,
//       name: 'atacadista',
//       phone: '(11) 11111-1111',
//       email: 'empresa1@hotmail.com',
//       cpf: '111.111.111-11',
//       cnpj: '11.111.111/1111-11',
//       active: 'Sim',
//       registrationDate: '2022-12-19',
//       paymentDate: '2022-09-25',
//       value: '250.00',
//       address: 'rua Dr Jose Osorio Oliveira Azevedo',
//       latitude: '-47.126028',
//       longitude: '-23.517607'
//     },
//     {

//       promoterId: promoter.id,
//       name: 'assai',
//       phone: '(11) 99342-4754',
//       email: 'assai@gmail.com',
//       cpf: '726.838.768-77',
//       cnpj: '89.787.575/4567-56',
//       active: 'Sim',
//       registrationDate: '2023-04-06',
//       paymentDate: '2023-02-19',
//       value: '270.00',
//       address: '701 W Oakland Avenue',
//       latitude: 0,
//       longitude: 0
//     },
//     {

//       promoterId: promoter2.id,
//       name: 'carrefour',
//       phone: '',
//       email: 'empresa123@galaxy.com',
//       cpf: '213.425.534-32',
//       cnpj: '23.458.492/3048-54',
//       active: 'Sim',
//       registrationDate: '2023-04-06',
//       paymentDate: '2023-03-13',
//       value: '400.00',
//       address: 'internacional drive',
//       latitude: 0,
//       longitude: 0
//     },
//     {

//       promoterId: promoter.id,
//       name: 'Mercearia Paião',
//       phone: '(27)090801312',
//       email: 'empresa123@galaxy.com',
//       cpf: '213.425.534-32',
//       cnpj: '23.458.492/3048-54',
//       active: 'Sim',
//       registrationDate: '2023-04-06',
//       paymentDate: '2023-03-13',
//       value: '400.00',
//       address: 'internacional drive',
//       latitude: -19.161797153409104,
//       longitude: -40.771009502478776
//     }
//   ]);

//   console.log('Base de dados populada com sucesso.');
//   process.exit(0);
// };

// seedDatabase().catch(error => {
//   console.error('Erro ao popular a base de dados:', error);
//   process.exit(1);
// });
