docker-machine create --driver virtualbox --virtualbox-cpu-count 2 --virtualbox-memory 2048 haystack
docker-machine ip haystack
eval "$(docker-machine env haystack)"