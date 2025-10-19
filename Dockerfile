# Base image có Node + Debian (dễ cài Chrome)
FROM node:20-bookworm

# Environment
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Cài Chrome Stable và dependencies
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates fonts-liberation \
    libasound2 libatk1.0-0 libatk-bridge2.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 \
    libnss3 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Cài Chrome từ Google repo
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-linux.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/google-linux.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Làm việc trong /app
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Biên dịch TypeScript
RUN npx tsc

# Remove dev dependencies sau khi build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]