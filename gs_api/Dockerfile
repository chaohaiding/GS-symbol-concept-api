FROM node:12-slim

WORKDIR /gsapi
ENV NODE_ENV development

COPY package.json /gsapi/package.json

RUN npm install --production

COPY .env.dev /gsapi/.env.dev
COPY . /gsapi

CMD ["npm","start"]

EXPOSE 8080
