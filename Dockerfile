# Stage 1: Build stage
FROM node:20.11-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production stage
FROM node:20.11-alpine

WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port your app runs on (if applicable)
# EXPOSE 3000

# Define any environment variables if needed
# ENV NODE_ENV=production

# Start your application
CMD ["node", "dist/main.js"]