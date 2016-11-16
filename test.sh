#!/bin/bash
echo ==========Build images==========
#docker build -t nodejsimg nodejs/
docker build -t webserverimg webserver/

echo ==========Create user network==========
docker network create -d bridge --subnet 172.25.0.0/16 isolatenw

echo ==========Run volume client and server==========
docker run -d --net=isolatenw --ip=172.25.0.8 --name webserver -p 8080:8080 webserverimg 

sleep 30s

docker exec webserver nodejs /HayStack/webserver/webserver.js

echo ==========Remove containers==========
docker stop webserver
docker rm webserver

echo ==========Remove images==========
docker rmi webserverimg

echo ==========Remove user network==========
docker network rm isolatenw
