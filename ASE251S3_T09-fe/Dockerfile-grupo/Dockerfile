# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile-grupo — Frontend Angular 19 + Nginx
# Imagen de grupo: concaflores/proyectofrontend:latest
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build con Node 22 (LTS compatible con Angular 19)
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar cache de Docker
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copiar el resto del proyecto y compilar en modo producción
COPY . .
RUN npm run build -- --configuration production


# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos compilados de Angular
# outputPath en angular.json: dist/ase251-s3-t09-fe/browser
COPY --from=builder /app/dist/ase251-s3-t09-fe/browser /usr/share/nginx/html

# Copiar nginx.conf como TEMPLATE (se procesa con envsubst al arrancar)
COPY Dockerfile-grupo/nginx.conf /etc/nginx/templates/default.conf.template

# Valor por defecto para desarrollo local (puede sobreescribirse con -e BACKEND_HOST=...)
ENV BACKEND_HOST=springboot-backend

EXPOSE 80

# nginx:alpine incluye envsubst. El entrypoint oficial de la imagen nginx
# procesa automáticamente los archivos en /etc/nginx/templates/ usando envsubst
# y los deja en /etc/nginx/conf.d/ antes de arrancar nginx.
CMD ["nginx", "-g", "daemon off;"]


# ─────────────────────────────────────────────────────────────────────────────
# CONSTRUIR Y SUBIR LA IMAGEN
# Ejecutar desde(dentro de ): cd ASE251S3_T09-fe-develop/ASE251S3_T09-fe-develop/
# docker build -t concaflores/proyectofrontend:latest -f Dockerfile-grupo/Dockerfile .
# docker push concaflores/proyectofrontend:latest
# ─────────────────────────────────────────────────────────────────────────────
