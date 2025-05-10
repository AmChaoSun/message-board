import { DynamoDB } from "aws-sdk";
import { ENV } from "./env";

const dynamoDb = new DynamoDB({
  endpoint: ENV.DYNAMODB_ENDPOINT,
  region: ENV.REGION,
});

const init = async () => {
  const params: DynamoDB.CreateTableInput = {
    TableName: ENV.USER_TABLE,
    AttributeDefinitions: [
      {
        AttributeName: "email",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "email",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  };

  try {
    console.log(`Checking if table ${ENV.USER_TABLE} exists...`);

    // Check if the table exists
    await dynamoDb.describeTable({ TableName: ENV.USER_TABLE }).promise();
    console.log(`Table ${ENV.USER_TABLE} exists. Deleting...`);

    await dynamoDb.deleteTable({ TableName: ENV.USER_TABLE }).promise();
    console.log(`Table ${ENV.USER_TABLE} deleted successfully.`);
  } catch (error: any) {
    if (error.code === "ResourceNotFoundException") {
      console.log(
        `Table ${ENV.USER_TABLE} does not exist. Proceeding with creation.`
      );
    } else {
      console.error("Error checking table existence:", error.message);
      return;
    }
  }

  try {
    console.log(`Creating table ${ENV.USER_TABLE}...`);
    await dynamoDb.createTable(params).promise();
    console.log(`Table ${ENV.USER_TABLE} created successfully.`);
  } catch (error: any) {
    console.error("Error creating table:", error.message);
  }
};

init();
