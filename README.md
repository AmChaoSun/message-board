# Local Development Setup for Message Board

## Prerequisites

- Node.js and npm installed
- Docker installed and running

## Setup Steps

1. **Install dependencies**

   ```bash
   npm install

2. **Compile TypeScript**
  ```bash
  npx tsc

3. **Start local DynamoDB**
  ```bash
  docker run -d -p 8000:8000 amazon/dynamodb-local

4. **Start local SQS (ElasticMQ)**
  ```bash
  docker run --rm -it -p 9324:9324 -p 9325:9325 softwaremill/elasticmq-native

5. **Initialize DynamoDB tables**
  ```bash
  npx ts-node init.ts

6. **Run the Serverless application locally**
  ```bash
  npx serverless offline