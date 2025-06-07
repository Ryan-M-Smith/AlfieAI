FROM node:24-slim
LABEL org.opencontainers.image.authors="Ryan Smith <rysmith2113@gmail.com>"

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy model and app source
COPY . . 

# Expose port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
