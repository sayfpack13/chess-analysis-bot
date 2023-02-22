FROM node:18
WORKDIR /cas
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "node", "app.js" ]