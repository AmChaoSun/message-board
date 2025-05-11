import { DynamoDB } from "aws-sdk";
import { User } from "./users.interface";
import { UsersRepository } from "./users.repository";
import { USERS_TABLE_NAME } from "./users.constants";
import { ENV } from "../../env";

export class DynamoDBUsersRepository implements UsersRepository {
  private readonly dynamoDb: DynamoDB.DocumentClient;

  constructor(dynamoDbClient?: DynamoDB.DocumentClient) {
    this.dynamoDb =
      dynamoDbClient ||
      new DynamoDB.DocumentClient({
        endpoint: ENV.DYNAMODB_ENDPOINT,
        region: ENV.REGION,
      });
  }

  async createUser(user: User): Promise<User> {
    const params = {
      TableName: USERS_TABLE_NAME,
      Item: user,
    };
    await this.dynamoDb.put(params).promise();
    const createdUser = await this.getUserByEmail(user.email);
    if (!createdUser) {
      throw new Error("User creation failed");
    }
    return createdUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const params = {
      TableName: USERS_TABLE_NAME,
      Key: { email },
    };
    const result = await this.dynamoDb.get(params).promise();
    return result.Item as User | null;
  }
}
