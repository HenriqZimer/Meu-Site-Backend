# --- Stage 1: Builder ---
FROM node:lts-trixie-slim AS builder

# Seleciona o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Define a URL do MongoDB para o build
ARG MONGODB_URI=
ENV MONGODB_URI=${MONGODB_URI}

# Gera a pasta dist
RUN npm run build:prod

# --- Stage 2: Production ---
FROM node:lts-trixie-slim

# Seleciona o diretório de trabalho
WORKDIR /app

# Copia node_modules já limpo (apenas prod)
COPY --from=builder /app/node_modules ./node_modules
# Copia o código compilado
COPY --from=builder /app/dist ./dist
# Copia package.json (útil para alguns frameworks lerem versão/scripts)
COPY --from=builder /app/package.json ./

# Expõe a porta
EXPOSE 5000

# Healthcheck ajustado
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "try { require('http').get('http://localhost:5000/api', (r) => process.exit(r.statusCode === 200 || r.statusCode === 404 ? 0 : 1)) } catch (e) { process.exit(1) }"

# Inicia a aplicação
CMD ["node", "dist/main"]