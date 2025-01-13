FROM node:21
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json to leverage Docker cache for npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install global dependencies
RUN npm install rimraf -g
RUN npm i bcrypt

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]