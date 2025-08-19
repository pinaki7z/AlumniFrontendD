FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including serve
RUN npm ci --only=production && npm install -g serve

# Copy source code
COPY . .

# Build the app
RUN GENERATE_SOURCEMAP=false npm run build
# RUN npm run build

# Expose port 3000
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]