FROM alpine:latest

RUN apk add --no-cache nodejs npm curl jq

WORKDIR /app

COPY . /app/

RUN npm install

EXPOSE 8081

ENTRYPOINT node app.js