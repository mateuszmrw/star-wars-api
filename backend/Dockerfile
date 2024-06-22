FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
COPY migrations ./migrations/

RUN yarn install
RUN npx prisma generate

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "run", "start:prod"]