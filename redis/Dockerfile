FROM redis:latest

# Update the repository and install Redis Server
RUN apt-get update && apt-get install -y redis-server
EXPOSE      6379
ENTRYPOINT  ["/usr/bin/redis-server"]
