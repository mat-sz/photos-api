FROM node:alpine as build

WORKDIR /app
ARG API_URL
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app

RUN apk add --no-cache make gcc g++ python && \
  npm install --production --silent && \
  apk del make gcc g++ python
RUN npx sequelize-cli db:migrate

EXPOSE 4000
ENV IP 0.0.0.0
CMD ["npm", "start"]