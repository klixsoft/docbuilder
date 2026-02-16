FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat curl openssl && \
    addgroup -S nodejs && \
    adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3003

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3003 \
    HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
