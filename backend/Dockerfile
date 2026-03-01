
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

FROM node:18-alpine

# Konteyner içindeki çalışma klasörümüz
WORKDIR /app

# Önce paket listesini kopyala ve kütüphaneleri kur
COPY package*.json ./
RUN npm install

# Sonra tüm kodlarımızı kopyala
COPY . .

# 3000 portunu dışarı aç
EXPOSE 3000

# Geliştirme modunda başlat main
CMD ["npm", "run", "dev"]