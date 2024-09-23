"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImageAndGetUrl = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const saveImageAndGetUrl = (base64Data, uploadDir, req) => {
    // Verificar se o diretório existe, e criar se necessário
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir);
    }
    // Convertendo a imagem base64 em buffer binário
    const imageBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
    // Gerando um nome único para a imagem
    const imageName = `${(0, uuid_1.v4)()}.jpg`;
    // Definindo o caminho onde a imagem será salva
    const imagePath = path_1.default.join(uploadDir, imageName);
    // Salvando a imagem no sistema de arquivos
    fs_1.default.writeFileSync(imagePath, imageBuffer);
    // Gerando a URL pública para acessar a imagem
    const protocol = req.protocol; // http ou https
    console.log(req);
    console.log('host aqui', req.get('host'));
    const host = req.get('host');
    const imageUrl = `${protocol}s://${host}/uploads/${imageName}`;
    // Retornando a URL da imagem salva
    return imageUrl;
};
exports.saveImageAndGetUrl = saveImageAndGetUrl;
