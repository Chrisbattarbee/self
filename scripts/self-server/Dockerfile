FROM openjdk:11.0.14.1-oracle

RUN set -eux; \
    mkdir -p /opt/self/services;

ADD self-server/ /opt/self/services/self-server

RUN chmod +x /opt/self/services/self-server

EXPOSE 8000

WORKDIR /opt/self/services/self-server/
ENTRYPOINT ["./bin/self-server", "server", "var/conf/selfserver.yml"]
