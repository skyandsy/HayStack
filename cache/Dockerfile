FROM node:slim
RUN npm install express && \
	npm install http && \
	npm install redis

ADD index.js index.js

# Update the repository and install Redis Server
#RUN apt-get update

#CMD ["npm","start"]
