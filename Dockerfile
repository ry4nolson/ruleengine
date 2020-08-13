FROM node:12-alpine
WORKDIR /app
COPY . .
ENV TWILIO_SID=
ENV TWILIO_TOKEN=
ENV TWILIO_TO=
ENV TWILIO_FROM=

RUN npm update
CMD ["node", "src/index.js"]