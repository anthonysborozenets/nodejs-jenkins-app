# Базовий образ — Node.js 20 на Alpine (легкий)
FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json і встановлюємо залежності
# (включаючи devDependencies — потрібні для npm test)
COPY package*.json ./
RUN npm install

# Копіюємо весь код застосунку і тести
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
