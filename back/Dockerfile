# Stage 1: Build the application
FROM node:20.9.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install\
  && npm install -g typescript
COPY . .
RUN tsc

# Stage 2: Run the application
FROM node:20.9.0
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
EXPOSE 3030
CMD ["npm", "run", "start"]
