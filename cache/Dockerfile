FROM node:slim
RUN npm install express && \
	npm install http && \
	npm install redis && \
	npm install cassandra-driver
ADD . .

# Update the repository and install Redis Server
RUN apt-get update

CMD ["npm","start"]
