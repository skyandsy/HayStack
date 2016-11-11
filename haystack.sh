docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
docker-machine create --driver virtualbox --virtualbox-cpu-count 2 --virtualbox-memory 2048 haystack
docker-machine ip haystack
eval "$(docker-machine env haystack)"
docker build -t nginx ./nginx
docker run -d --name nginx -p 80:80 --link node:node nginx

docker build -t redis ./cache
docker run -d --name redis -p 6379:6379 redis

docker build -t cassandra ./directory
docker run -d --name cassandra -p 9042:9042 cassandra