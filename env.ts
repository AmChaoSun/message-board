// This file is usually not upoaded as a .env locally
// Here use a env.ts for demonstration purposes

export const ENV = {
  DYNAMODB_ENDPOINT: "http://localhost:8000",
  SNS_ENDPOINT: "http://localhost:4002",
  REGION: "ap-southeast-2",
  USER_TABLE: "UsersTable",
  SNS_TOPIC_ARN:
    "arn:aws:sns:ap-southeast-2:123456789012:UserRegistrationTopic",
};
