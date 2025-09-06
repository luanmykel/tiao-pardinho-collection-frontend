# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_AUTH_PERSIST
ENV VITE_AUTH_PERSIST=${VITE_AUTH_PERSIST}

COPY . .
RUN npm run build
RUN npm prune --production

# ---- Stage 2: Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
