# nfcqrkartim mağazası: Next.js standalone + SQLite (node:sqlite, ek paket yok).
# Veri /veri klasöründe; bu klasör kalıcı birime (volume) bağlanmalı, yoksa her dağıtımda siparişler silinir.

FROM node:24-alpine AS bagimliliklar
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS derleme
WORKDIR /app
# Statik sayfalardaki canonical / paylaşım adresleri derleme anında yazılır.
ARG SITE_ADRESI=https://nfcqrkartimcom.ahmcloud.com
ENV NEXT_TELEMETRY_DISABLED=1 SITE_ADRESI=$SITE_ADRESI
COPY --from=bagimliliklar /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS calisma
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    VERI_KOKU=/veri \
    NODE_OPTIONS=--disable-warning=ExperimentalWarning
RUN addgroup -S magaza && adduser -S magaza -G magaza && mkdir -p /veri && chown magaza:magaza /veri
COPY --from=derleme --chown=magaza:magaza /app/public ./public
COPY --from=derleme --chown=magaza:magaza /app/.next/standalone ./
COPY --from=derleme --chown=magaza:magaza /app/.next/static ./.next/static
# Görsel iyileştirici (sharp) yerel kütüphanelerini standalone izleyicisi her zaman kopyalamıyor; açıkça ekle.
COPY --from=derleme --chown=magaza:magaza /app/node_modules/@img ./node_modules/@img
USER magaza
VOLUME ["/veri"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/saglik >/dev/null || exit 1
CMD ["node", "server.js"]
