FROM --platform=linux/amd64 node:18 AS builder

WORKDIR /app

# First install dependencies
COPY package*.json ./
RUN npm install

# Then copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate --schema=prisma/postsql.prisma

# Finally copy source and build
COPY . .
RUN npm run build

FROM --platform=linux/amd64 node:18-slim

WORKDIR /app

# Copy only the necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/config ./config

# Generate Prisma Client for production
RUN npx prisma generate --schema=prisma/postsql.prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 