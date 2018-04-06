FROM nginx:latest
RUN apt-get update && apt-get install -y iputils-ping net-tools
COPY ./default.conf /etc/nginx/conf.d/default.conf