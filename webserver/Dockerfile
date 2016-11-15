FROM ubuntu:16.04

RUN apt-get update

# install curl
RUN apt-get install -y curl

# install java
RUN apt-get install -y openjdk-8-jdk 

# install cassandra
RUN echo "deb http://www.apache.org/dist/cassandra/debian 36x main" | tee -a /etc/apt/sources.list.d/cassandra.sources.list
RUN curl https://www.apache.org/dist/cassandra/KEYS | apt-key add -
RUN apt-get update
RUN apt-get install -y cassandra
RUN sed -i 's/start_rpc: false/start_rpc: true/g' /etc/cassandra/cassandra.yaml

# install nodejs
RUN apt-get install -y nodejs
RUN apt-get install -y npm

# install nodejs dependencies
RUN npm install body-parser && \
    npm install multer && \
    npm install crypto && \
    npm install express && \
    npm install express-cassandra

# copy files
RUN mkdir /HayStack && \
    mkdir /HayStack/webserver
COPY ["webserver.js", "/HayStack/webserver/"]
