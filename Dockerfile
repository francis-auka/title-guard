# Use Node.js 18 (or whichever version you prefer)
FROM node:18-alpine

# Create app directory
WORKDIR /app

# We only care about deploying the backend
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install --production

# Bundle app source (the backend folder)
COPY backend/ ./backend/

# Expose the port (Railway provides PORT env variable)
ENV PORT=5000
EXPOSE 5000

# Start the server (Railway will run this)
WORKDIR /app/backend
CMD [ "npm", "start" ]
