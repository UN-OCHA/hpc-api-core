FROM unocha/nodejs:12

RUN apk add -U build-base python3 py-pip

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

RUN rm -rf /etc/services.d/node

COPY ./env/api/node.sh /node.sh
RUN chmod +x /node.sh

CMD /node.sh