FROM node:14-alpine
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app
RUN npm run build:ts

ENV NODE_ENV=production
RUN npm prune
RUN rm -rf index.ts src/**/*.ts scripts

EXPOSE 3000
CMD ["node", "index.js"]