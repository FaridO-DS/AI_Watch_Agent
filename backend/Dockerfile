FROM node:22-alpine
WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

# Ajustez selon l'emplacement exact de votre server.js (ici à la racine du projet backend)
CMD ["node", "src/server.js"]
