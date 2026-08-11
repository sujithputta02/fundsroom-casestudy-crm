FROM node:22-slim

# Set working directory
WORKDIR /app

# Install OpenSSL, Chromium, and other dependencies required by Prisma and Puppeteer
RUN apt-get update -y && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    chromium \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to skip downloading Chrome (we installed Chromium via apt)
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

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
