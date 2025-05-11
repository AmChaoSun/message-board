import { DynamoDB } from "aws-sdk";
import { ENV } from "./env";

const dynamoDb = new DynamoDB({
  endpoint: ENV.DYNAMODB_ENDPOINT,
  region: ENV.REGION,
});

const initTable = async (
  tableName: string,
  params: DynamoDB.CreateTableInput
) => {
  try {
    console.log(`Checking if table ${tableName} exists...`);

    // Check if the table exists
    await dynamoDb.describeTable({ TableName: tableName }).promise();
    console.log(`Table ${tableName} exists. Deleting...`);

    await dynamoDb.deleteTable({ TableName: tableName }).promise();
    console.log(`Table ${tableName} deleted successfully.`);
  } catch (error: any) {
    if (error.code === "ResourceNotFoundException") {
      console.log(
        `Table ${tableName} does not exist. Proceeding with creation.`
      );
    } else {
      console.error(
        `Error checking table existence for ${tableName}:`,
        error.message
      );
      return;
    }
  }

  try {
    console.log(`Creating table ${tableName}...`);
    await dynamoDb.createTable(params).promise();
    console.log(`Table ${tableName} created successfully.`);
  } catch (error: any) {
    console.error(`Error creating table ${tableName}:`, error.message);
  }
};

const init = async () => {
  // Initialize UsersTable
  await initTable(ENV.USER_TABLE, {
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
  });

  // Initialize BoardsTable
  await initTable(ENV.BOARD_TABLE, {
    TableName: ENV.BOARD_TABLE,
    AttributeDefinitions: [
      {
        AttributeName: "boardId",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "boardId",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });

  // Initialize MessagesTable
  await initTable(ENV.MESSAGE_TABLE, {
    TableName: ENV.MESSAGE_TABLE,
    AttributeDefinitions: [
      {
        AttributeName: "messageId",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "messageId",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });
};

init();
