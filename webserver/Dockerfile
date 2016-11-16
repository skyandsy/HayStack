FROM cassandra:latest

RUN apt-get update

# install nodejs
RUN apt-get install -y sudo curl python-software-properties
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install nodejs

# install nodejs dependencies
RUN npm install body-parser && \
    npm install http && \
    npm install multer && \
    npm install crypto && \
    npm install express && \
    npm install cassandra-driver && \
    npm install express-cassandra


# web server files
RUN mkdir /HayStack && \
    mkdir /HayStack/webserver
COPY ["webserver.js", "/HayStack/webserver/"]
COPY ["index.htm", "/HayStack/webserver/"]
