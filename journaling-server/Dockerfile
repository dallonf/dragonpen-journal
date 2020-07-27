FROM node:14-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app
RUN npm run build:ts
RUN rm src/**/*.ts

FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install --production
COPY --from=builder /app/src /app/src
COPY --from=builder /app/index.js /app/index.js
EXPOSE 3000
CMD ["node", "index.js"]