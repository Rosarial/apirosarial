"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config/config");
const models_1 = require("./models");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const checkinRoutes_1 = __importDefault(require("./routes/checkinRoutes"));
const checkoutRoutes_1 = __importDefault(require("./routes/checkoutRoutes"));
const healthCheckRoutes_1 = __importDefault(require("./routes/healthCheckRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const swagger_1 = __importDefault(require("./swagger"));
const app = (0, express_1.default)();
const PORT = config_1.PORT_DEFAULT || 3000;
const corsOptions = {
    origin: [
        'capacitor://localhost',
        'http://localhost',
        'http://localhost:8100',
        '*',
    ], // Substitua pelo domínio do seu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Content-Type',
        'application/json',
        'X-Requested-With',
        'XMLHttpRequest',
    ],
};
// Middleware para lidar com JSON com limite aumentado
app.use(body_parser_1.default.json({ limit: '150mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '150mb', extended: true }));
app.use((0, cors_1.default)());
// Configurar arquivos estáticos fotos checkins/checkouts e uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// Roteamento
app.use('/api/auth', authRoutes_1.default);
app.use('/api/stores', storeRoutes_1.default);
app.use('/api/checkin', checkinRoutes_1.default);
app.use('/api/checkout', checkoutRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api', healthCheckRoutes_1.default);
const optionsSyncSequelize = {
    alter: false, // update das tabelas sem deletar
    force: false, // deletar tudo e recriar
    benchmark: false,
};
// Configurar Swagger
(0, swagger_1.default)(app);
// Conectar ao banco de dados e iniciar o servidor
// sequelize.sync({ alter: true }); //
models_1.sequelize
    .authenticate()
    .then(() => {
    console.log('Database connection has been established successfully.');
    return models_1.sequelize.sync(optionsSyncSequelize);
})
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Unable to connect to the database:', error);
});
exports.default = app;
