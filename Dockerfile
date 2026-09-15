FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/
COPY .env ./

CMD ["node", "src/index.js"]