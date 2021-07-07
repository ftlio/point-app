# Dockerfile
# Buiild stage
FROM node:14.17-alpine as build-node-modules
WORKDIR /usr/src/app
COPY package.json .
RUN npm install

FROM node:14.17-alpine as build-typescript
WORKDIR /usr/src/app
COPY --from=build-node-modules /usr/src/app .
COPY . .
RUN ./node_modules/typescript/bin/tsc

# Run stage
FROM node:14.17-alpine as app
WORKDIR /usr/src/app
COPY entrypoint.sh .
COPY --from=build-node-modules /usr/src/app .
COPY --from=build-typescript /usr/src/app/dist .
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
