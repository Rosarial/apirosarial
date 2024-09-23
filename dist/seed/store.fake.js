"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStores = void 0;
const faker_1 = require("@faker-js/faker");
const store_1 = require("../models/store");
// Função para gerar números de telefone aleatórios
const generatePhoneNumber = () => {
    const areaCode = Math.floor(Math.random() * 90) + 10;
    const middle = Math.floor(Math.random() * 90000) + 10000;
    const end = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${middle}-${end}`;
};
// Função para gerar CPF aleatório
const generateCPF = () => {
    const getRandomInt = (max) => Math.floor(Math.random() * max);
    return `${getRandomInt(999)}.${getRandomInt(999)}.${getRandomInt(999)}-${getRandomInt(99)}`;
};
// Função para gerar CNPJ aleatório
const generateCNPJ = () => {
    const getRandomInt = (max) => Math.floor(Math.random() * max);
    return `${getRandomInt(99)}.${getRandomInt(999)}.${getRandomInt(999)}/0001-${getRandomInt(99)}`;
};
// Função para gerar um valor aleatório
const generateValue = () => (Math.random() * 500).toFixed(2);
// Função para gerar coordenadas de latitude e longitude aleatórias
const generateCoordinates = () => {
    const latitude = (Math.random() * 180 - 90).toFixed(6);
    const longitude = (Math.random() * 360 - 180).toFixed(6);
    return { latitude, longitude };
};
const seedStores = async (promoters) => {
    const stores = [];
    for (let i = 0; i < 50; i++) {
        const promoter = promoters[i % promoters.length]; // Alterna entre os promotores
        const coordinates = generateCoordinates();
        stores.push({
            promoterId: promoter.id,
            name: faker_1.faker.company.name(),
            phone: generatePhoneNumber(),
            email: faker_1.faker.internet.email(),
            cpf: generateCPF(),
            cnpj: generateCNPJ(),
            active: 'Sim',
            registrationDate: faker_1.faker.date.past(),
            paymentDate: faker_1.faker.date.past(),
            value: generateValue(),
            address: faker_1.faker.location.streetAddress({ useFullAddress: true }),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
        });
    }
    await store_1.Store.bulkCreate(stores);
    console.log('Stores seeded successfully');
};
exports.seedStores = seedStores;
