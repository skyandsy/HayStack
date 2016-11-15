FROM java:8u111-jdk

# install nodejs
RUN apt-get install python-software-properties
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install nodejs

# test nodejs
RUN mkdir /src && \
    mkdir /src/webserver
COPY ["test.js", "/src/webserver/"]
RUN node /src/webserver/test.js
