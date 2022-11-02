FROM node:16.18 AS dev-stage
WORKDIR /code

FROM dev-stage AS release-stage
COPY ./package*.json ./
RUN npm install
COPY ./ ./
ENTRYPOINT []
CMD ["npm", "start"]
