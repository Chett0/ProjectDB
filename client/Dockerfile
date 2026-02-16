FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package*.json angular.json tsconfig.app.json tsconfig.json ./
RUN npm ci

# Copy sources and build production bundle
COPY . .
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
# Remove default nginx page then copy built files (copy contents)
RUN rm -rf /usr/share/nginx/html/*
## Copy the built Angular production files
# Angular output is in /app/dist/client/browser (Angular 15+ creates 'browser' folder)
COPY --from=builder /app/dist/client/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
