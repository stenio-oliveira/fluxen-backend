FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Keep node environment as development for dev image
ENV NODE_ENV=development

# Copy dependency manifests first for better caching
COPY package.json package-lock.json* tsconfig.json ./

# Install dependencies (including devDependencies so tsx is available)
RUN npm install --silent

# Copy everything else
COPY . .

# Generate Prisma client (uses the local prisma binary)
RUN npx prisma generate || true

# Expose app port
EXPOSE 3000

# Default development command: (re)generate prisma client then run the dev watcher
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
