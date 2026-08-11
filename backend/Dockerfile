FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL 1.1 for Prisma
RUN apk add --no-cache python3 make g++ openssl1.1-compat

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
