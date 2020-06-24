FROM node:13

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Setup directory and copy packege.json
WORKDIR /usr/src/app
COPY website/package*.json ./

# Run installation for packages
RUN npm install

# Copy code into work directory
COPY website/ .

# Build the website
RUN npm run build

# Expose and host
EXPOSE 3000
CMD [ "npm", "start" ]