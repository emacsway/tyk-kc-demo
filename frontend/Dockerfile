FROM node:18.12.1

WORKDIR /front

RUN mkdir -m 0777 -p /front/node_modules

RUN echo $(ls)

COPY . .

RUN echo $(ls -l)

RUN npm install

RUN echo $(ls -l)

EXPOSE 5173
