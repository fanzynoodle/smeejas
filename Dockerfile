FROM node
ENV NODE_ENV=production

WORKDIR /app

COPY src /app

RUN npm install --production

COPY . .

CMD [ "node", "index.js" ]
