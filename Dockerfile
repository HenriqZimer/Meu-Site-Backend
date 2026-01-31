# --- Stage 1: Builder ---
FROM cgr.dev/chainguard/node:latest AS builder

# Cria o usuário 'node'
USER node

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY --chown=node:node package*.json ./

# Instala as dependências
RUN npm ci --no-audit

COPY --chown=node:node . .

# Define a URL do MongoDB para o build
ARG MONGODB_URI=
ENV MONGODB_URI=${MONGODB_URI}

# Executa o comando de build que cria o bundle de produção
RUN npm run build:prod

# Limpa o cache do npm para reduzir o tamanho da imagem
RUN npm prune --production

# --- Stage 2: Production ---
FROM cgr.dev/chainguard/node:latest AS production

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos empacotados da etapa de build para a imagem de produção
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Healthcheck adicionado para verificar se a API está respondendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "try { require('http').get('http://localhost:5000/api', (r) => process.exit(r.statusCode === 200 || r.statusCode === 404 ? 0 : 1)) } catch (e) { process.exit(1) }"

# Start the server using the production build
CMD [ "dist/main" ]
