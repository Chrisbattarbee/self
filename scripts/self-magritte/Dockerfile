FROM python:3.9-buster

RUN set -eux; \
    mkdir -p /opt/self/services;

RUN apt-get update && apt-get -y install nodejs

ADD self-magritte/ /opt/self/services/self-magritte

RUN chmod +x /opt/self/services/self-magritte

EXPOSE 8001

WORKDIR /opt/self/services/self-magritte/bin
ENTRYPOINT ["./self-magritte"]
