FROM node:21.7.1

WORKDIR /app

RUN mkdir -m 0777 -p /app/node_modules

RUN echo $(ls)

COPY . .

RUN echo $(ls -l)

RUN npm install && npm i pnpm && npm run build

RUN echo $(ls -l)

EXPOSE 3000
