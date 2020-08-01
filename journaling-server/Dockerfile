FROM node:14 AS builder
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app
RUN npm run build:ts
RUN bash -O globstar -c "rm src/**/*.ts migrations/**/*.ts"

FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm install --production
COPY migrations /app/migrations
COPY knexfile.js /app/knexfile.js
COPY --from=builder /app/src /app/src
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/index.js /app/knexfile.js /app/
EXPOSE 3000
CMD ["node", "index.js"]