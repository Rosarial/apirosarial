FROM node:20-alpine3.19

RUN mkdir -p /usr/src/backend
WORKDIR /usr/src/backend

# Limpar node_modules e package-lock.json
RUN rm -rf ./node_modules
RUN rm -rf package-lock.json

# Copiar e instalar dependências
COPY ./package.json .
RUN npm install --verbose

# Copiar o restante do código
COPY . .

# Copiar o script de inicialização e torná-lo executável
COPY entrypoint.sh /usr/src/backend/entrypoint.sh
RUN chmod +x /usr/src/backend/entrypoint.sh

# Executar o script de inicialização
CMD [ "/usr/src/backend/entrypoint.sh" ]
