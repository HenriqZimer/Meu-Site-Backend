# --- Stage 1: Builder ---
FROM node:lts-trixie-slim AS builder

WORKDIR /app

COPY package*.json ./

# Instala tudo (dev + prod) com cache para o build
RUN --mount=type=cache,target=/root/.npm \
  npm ci --prefer-offline --no-audit --progress=false --loglevel=error

COPY . .

# Argumentos e variáveis de build
ARG MONGODB_URI=
ENV MONGODB_URI=${MONGODB_URI}

# 1. Gera a pasta dist
RUN npm run build

# 2. Limpa as dependências de desenvolvimento
# Isso remove pacotes como typescript, eslint, jest da pasta node_modules
RUN npm prune --production

# --- Stage 2: Production ---
FROM node:lts-trixie-slim

WORKDIR /app

# OTIMIZAÇÃO: Não precisamos mais rodar npm ci aqui!
# Copiamos apenas o necessário do estágio builder

# Copia node_modules já limpo (apenas prod)
COPY --from=builder /app/node_modules ./node_modules
# Copia o código compilado
COPY --from=builder /app/dist ./dist
# Copia package.json (útil para alguns frameworks lerem versão/scripts)
COPY --from=builder /app/package.json ./

EXPOSE 5000

# Healthcheck ajustado
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "try { require('http').get('http://localhost:5000/api', (r) => process.exit(r.statusCode === 200 || r.statusCode === 404 ? 0 : 1)) } catch (e) { process.exit(1) }"

# Inicia a aplicação
CMD ["node", "dist/main"]