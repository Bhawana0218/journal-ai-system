# Use Node.js Alpine image (lightweight)
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend code into container
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend in dev mode
CMD ["npm", "run", "dev"]