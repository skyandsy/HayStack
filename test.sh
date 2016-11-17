#!/bin/bash
echo ==========Clean===========
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker network rm isolatenw

echo ==========Build images==========
#docker build -t nodejsimg nodejs/
docker build -t webserverimg webserver/
docker build -t storageimg storage/

echo ==========Create user network==========
docker network create -d bridge --subnet 172.18.0.0/16 isolatenw

echo ==========Run volume client and server==========
docker run -d --net isolatenw --ip 172.18.0.13 --name storage storageimg python server.py

docker run -d --net isolatenw --ip 172.18.0.11 --name webserver -p 8080:8080 webserverimg 
sleep 30s
docker exec webserver nodejs /HayStack/webserver/webserver.js

#echo ==========Remove containers==========
#docker stop webserver
#docker rm webserver
#docker stop storage
#docker rm storage

#echo ==========Remove images==========
#docker rmi webserverimg
#docker rmi storageimg

#echo ==========Remove user network==========
#docker network rm isolatenw
