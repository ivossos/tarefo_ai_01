FROM node:20-slim

# Configurar diretório de trabalho
WORKDIR /app

# Instalar dependências Python e outras ferramentas necessárias
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de configuração
COPY package*.json ./
COPY pyproject.toml ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./
COPY components.json ./

# Instalar dependências
RUN npm ci
RUN pip3 install -r requirements.txt || pip3 install crewai langchain langchain-anthropic openai pyyaml

# Copiar código-fonte
COPY . .

# Compilar o TypeScript
RUN npm run build

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]