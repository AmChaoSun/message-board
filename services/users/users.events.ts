import { SNS } from "aws-sdk";
import { DynamoDBUsersRepository } from "./users.dynamodb";
import { UsersService } from "./users.service";
import { DuplicateUserError } from "./users.errors";
import { ENV } from "../../env";

const sns = new SNS({
  endpoint: ENV.SNS_ENDPOINT,
  region: ENV.REGION,
});
const usersRepository = new DynamoDBUsersRepository();
const usersService = new UsersService(usersRepository, sns);

export const registerUser = async (event: any) => {
  const { name, email } = JSON.parse(event.body);

  try {
    await usersService.registerUser(name, email);
    return {
      statusCode: 202,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "User registration initiated." }),
    };
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error.message }),
      };
    }

    // Handle other unexpected errors
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
export const saveUserToDynamoDB = async (event: any) => {
  console.log("Received SNS event:", JSON.stringify(event));

  // Process each record in the SNS event
  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.Sns.Message);
    const { name, email } = snsMessage;

    // Save user to DynamoDB
    await usersService.saveUserToDb(name, email);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "User saved to DynamoDB." }),
  };
};

export const getUserByEmail = async (event: any) => {
  const { email } = event.queryStringParameters;

  const user = await usersService.findUserByEmail(email);

  if (!user) {
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
    body: JSON.stringify(user),
  };
};
