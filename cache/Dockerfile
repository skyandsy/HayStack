FROM node:7.0.0

# Update the repository and install Redis Server
RUN         apt-get update && apt-get install -y redis-server

# Expose Redis port 6379
EXPOSE      6379

# Run Redis Server
ENTRYPOINT  ["/usr/bin/redis-server"]

# cache package.json and node_modules to speed up builds
ADD package.json package.json
RUN npm install

# Add your source files
ADD . .
CMD ["npm","start"]
