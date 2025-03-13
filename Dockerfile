FROM node:18-slim

# تثبيت المتطلبات اللازمة لـ Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# إنشاء دليل العمل
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json ./
RUN npm install

COPY . .

# تعيين متغير بيئة لمسار Chromium
ENV CHROMIUM_PATH=/usr/bin/google-chrome-stable

# كشف المنفذ
EXPOSE 8080

# تشغيل التطبيق
CMD ["npm", "start"]
