FROM mariadb:latest

ENV MYSQL_RANDOM_ROOT_PASSWORD yes
ENV MYSQL_DATABASE website

ADD website.sql /docker-entrypoint-initdb.d