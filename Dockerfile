FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY . .

# Generate Prisma client first (creates src/generated/prisma)
RUN npx prisma generate

# Then compile TypeScript
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
