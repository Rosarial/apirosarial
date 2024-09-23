import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const saveImageAndGetUrl = (
  base64Data: string,
  uploadDir: string,
  req: Request
): string => {
  // Verificar se o diretório existe, e criar se necessário
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Convertendo a imagem base64 em buffer binário
  const imageBuffer = Buffer.from(base64Data.split(',')[1], 'base64');

  // Gerando um nome único para a imagem
  const imageName = `${uuidv4()}.jpg`;

  // Definindo o caminho onde a imagem será salva
  const imagePath = path.join(uploadDir, imageName);

  // Salvando a imagem no sistema de arquivos
  fs.writeFileSync(imagePath, imageBuffer);

  // Gerando a URL pública para acessar a imagem
  const protocol = req.protocol; // http ou https
  console.log(req);
  console.log('host aqui', req.get('host'));
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${imageName}`;

  // Retornando a URL da imagem salva
  return imageUrl;
};
