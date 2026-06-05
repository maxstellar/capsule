FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---

FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/build ./build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build/index.js"]
