#!/bin/bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | xargs )


echo "Binary version: [$PACKAGE_VERSION]"

npm run build
cd dist
cp ../cicd/Dockerfile .
cp -r ../node_modules .
cp -r ../kafka-bin kafka

BUILD_COMMAND="docker build -t ifloor/kafka-rebalancing-helper:$PACKAGE_VERSION ."
echo "Build command: $BUILD_COMMAND"

${BUILD_COMMAND}

PUSH_COMMAND="docker push ifloor/kafka-rebalancing-helper:$PACKAGE_VERSION"
echo "Push command: $PUSH_COMMAND"

${PUSH_COMMAND}
