import { SNS } from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import { ENV } from "./env";
import { v4 as uuidv4 } from "uuid";

const sns = new SNS({
  endpoint: ENV.SNS_ENDPOINT,
  region: ENV.REGION,
});

const dynamoDb = new DynamoDB.DocumentClient({
  endpoint: ENV.DYNAMODB_ENDPOINT,
  region: ENV.REGION,
});

const USER_TABLE = ENV.USER_TABLE;
const SNS_TOPIC_ARN = ENV.SNS_TOPIC_ARN;

export const helloWorld = async (event: any) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};

export const registerUser = async (event: any) => {
  const { name, email } = JSON.parse(event.body);

  // Create user data without userId
  const userData = {
    name,
    email,
  };

  // Publish to Local SNS
  await sns
    .publish({
      Message: JSON.stringify(userData),
      TopicArn: SNS_TOPIC_ARN,
    })
    .promise();

  console.log(
    `User registered and published to SNS: ${JSON.stringify(userData)}`
  );

  return {
    statusCode: 202,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "User registration initiated locally." }),
  };
};

export const saveUserToDynamoDB = async (event: any) => {
  console.log("Received SNS event:", JSON.stringify(event));

  for (const record of event.Records) {
    const userData = JSON.parse(record.Sns.Message);

    // Generate UUID for userId
    const userId = uuidv4();
    const userItem = {
      ...userData,
      userId,
    };

    const params = {
      TableName: USER_TABLE,
      Item: userItem,
    };

    try {
      await dynamoDb.put(params).promise();
      console.log(`User ${userId} saved successfully to DynamoDB`);
    } catch (error) {
      console.error("Error saving user to DynamoDB:", error);
    }
  }
};

export const getUserByEmail = async (event: any) => {
  const { email } = event.queryStringParameters;

  const params = {
    TableName: USER_TABLE,
    Key: {
      email,
    },
  };

  const result = await dynamoDb.get(params).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result.Item),
  };
};
