# Step 1: Use an official Node 18 runtime as a parent image
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Install project dependencies
RUN npm install

# Copy the current directory contents into the container
COPY . /app

# Build the app
RUN npm run build

# Step 2: Use nginx server to serve the static files
FROM nginx:1-alpine-slim as runtime

# Copy custom nginx configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the static build output to replace the default nginx contents.
COPY --from=build /app/dist/jacob-autobahn-app/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
