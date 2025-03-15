# Build stage
FROM oven/bun:latest as build
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 