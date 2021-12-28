FROM node:14-alpine AS installer
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:14-alpine AS runner
WORKDIR /app
COPY . .
COPY --from=installer /app/node_modules ./node_modules

ENTRYPOINT [ "node", "jscrates.js" ]
