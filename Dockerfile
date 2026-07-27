FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

# --mode production 을 명시하여 .env.production 을 반드시 읽도록 설정
RUN npx vite build --mode production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80