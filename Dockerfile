FROM node:latest

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

ENV PORT 8080
ENV MONGODB=mongodb://hotex:690102@hotexdb:28515/TexTrade?authSource=admin
ENV CLIENT_ORIGIN=http://47.96.122.87/hotex
ENV MQ=amqp://hotex:hotex@rabbitmq
ENV JWT_SECRET=MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAamUL/pm3t5EZ

# Expose port
EXPOSE  8080

# Run app using nodemon
CMD ["node", "/src/server.js"]
