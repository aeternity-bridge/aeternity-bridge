FROM node:20 as build

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV development

# copy src
COPY . /app/

ARG RUN_ENV
ARG NETWORK=sepolia

WORKDIR /app/frontend

RUN yarn install
RUN yarn prepare-deployment $NETWORK
RUN yarn build

###################################

FROM nginx:1-alpine

COPY --from=build /app/frontend/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
