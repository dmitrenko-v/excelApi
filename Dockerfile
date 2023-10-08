FROM node:18-alpine3.17
RUN apk add --no-cache imagemagick
WORKDIR /usr/src/app
COPY package*.json . 
RUN npm ci
COPY . .
CMD ["/bin/sh", "run.sh"]