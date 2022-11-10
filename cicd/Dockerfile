FROM openjdk:11

# Imutable stuff
# 1. Required variables
ENV KAFKA_BOOTSTRAP_SERVERS=REPLACE_ME

# 2. Optional variables
# TRACE, DEBUG, INFO, WARN, ERROR
ENV LOG_LEVEL=INFO
ENV CONFIG_PROPERTIES_FILE_PATH=""

ENTRYPOINT [ "node", "index.js" ]

# Mutable stuff
RUN apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_17.x | bash - \
  && apt-get install -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh

WORKDIR /usr/src/app
COPY . .
