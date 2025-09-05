#Sử dụng Node.js phiên bản 18 làm base image
FROM node:20

#Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

#Sao chép package.json và package-lock.json vào container
COPY package*.json ./

RUN npm install -g @nestjs/typeorm

RUN npm install -g @nestjs/cli

#Cài đặt Dependencies
RUN npm install

#Sao chép toàn bộ source vào container
COPY . .

#Build app
RUN npm run build

#RUN npm run migration:run

#Mở cổng app
EXPOSE 3001

#Start app
CMD ["npm","start"]
