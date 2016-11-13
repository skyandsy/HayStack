docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
docker-machine create --driver virtualbox --virtualbox-cpu-count 2 --virtualbox-memory 2048 haystack
docker-machine ip haystack
docker-machine restart haystack


eval "$(docker-machine env haystack)"
docker network create -d bridge sharednetwork
docker network inspect sharednetwork
docker network create --subnet=172.18.0.0/16 sharednetwork

docker build -t redis ./cache
docker run --net sharednetwork --ip 172.18.0.11 -d --name redis -p 6379:6379 redis

docker build -t cassndra ./directory
docker run --net sharednetwork --ip 172.18.0.2 -d --name cassandra -p 7199:7199 -p 9042:9042 -p 9160:9160 -p 7001:7001 cassandra
docker run -it --rm --net container:cassandra cassandra cqlsh
# docker exec -d  cqlsh -f init_cassandra_tables.txt


CREATE KEYSPACE test_keyspace WITH REPLICATION = 
{'class': 'SimpleStrategy', 'replication_factor': 1};

USE test_keyspace;

CREATE TABLE test_table (
  id text,
  test_value text,
  PRIMARY KEY (id)
);

INSERT INTO test_table (id, test_value) VALUES ('1', 'one');
INSERT INTO test_table (id, test_value) VALUES ('2', 'two');
INSERT INTO test_table (id, test_value) VALUES ('3', 'three');

SELECT * FROM test_table;

docker build -t webserver ./webserver
docker run --net sharednetwork --ip 172.18.0.3 -d --name webserver -p 8080 webserver

docker build -t nginx ./nginx
docker run --net sharednetwork --ip 172.18.0.4 -d --name nginx -p 80:80 --link webserver:webserver nginx
docker network connect sharednetwork nginx
