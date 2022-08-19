

# Copyright 2020 Google, LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Use the official lightweight Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:16-slim AS build-image

# Create and change to the app directory.
WORKDIR /usr/src/build

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY . ./

# Install dependencies.
RUN yarn install && yarn clean && yarn build

FROM node:16-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

COPY --from=build-image /usr/src/build/package.json /usr/src/build/yarn.lock /usr/src/build/build build/

# Install dependencies and fix the file structure
RUN mv build/package.json . && mv build/yarn.lock . && yarn install --prod

EXPOSE 3000
# Run the web service on container startup.
CMD [ "yarn", "start-prod" ]
