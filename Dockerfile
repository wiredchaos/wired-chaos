# Use official Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies (ignore if no package.json)
RUN if [ -f package.json ]; then npm install; fi

# Copy all source code
COPY . .

# Default command: start a shell (can override)
CMD ["sh"]
