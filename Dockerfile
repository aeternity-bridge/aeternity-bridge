FROM node:20 as build

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV development

# copy src
COPY . /app/

ARG RUN_ENV
ARG NETWORK=sepolia

# WORKDIR /app

# RUN npm install
# RUN npm run compile-evm
# RUN npm run compile-ae

WORKDIR /app/acurast/signer

RUN npm install
RUN npm run build