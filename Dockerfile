# PropAI — single-stage build, runs Express+Vite-built React on one port.
# Hugging Face Spaces convention: app must listen on $PORT (7860).
FROM node:22-bookworm-slim

# better-sqlite3 needs build tools to compile its native binding.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Layer caching: install deps first.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy source and build the Vite frontend bundle into ./dist.
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["npx", "tsx", "server.ts"]
