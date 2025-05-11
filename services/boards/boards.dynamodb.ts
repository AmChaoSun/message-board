import { DynamoDB } from "aws-sdk";
import { Board, Message } from "./boards.interface";
import { ENV } from "../../env";
import { BOARDS_TABLE_NAME, MESSAGES_TABLE_NAME } from "./boards.constants";
import { BoardsRepository } from "./boards.repository";

export class DynamoDBBoardsRepository implements BoardsRepository {
  private readonly dynamoDb: DynamoDB.DocumentClient;

  constructor(dynamoDbClient?: DynamoDB.DocumentClient) {
    this.dynamoDb =
      dynamoDbClient ||
      new DynamoDB.DocumentClient({
        endpoint: ENV.DYNAMODB_ENDPOINT,
        region: ENV.REGION,
      });
  }

  async createBoard(board: Board): Promise<void> {
    const params = {
      TableName: BOARDS_TABLE_NAME,
      Item: board,
    };
    await this.dynamoDb.put(params).promise();
  }

  async listAllBoards(): Promise<Board[]> {
    const params = {
      TableName: BOARDS_TABLE_NAME,
    };
    const result = await this.dynamoDb.scan(params).promise();
    return result.Items as Board[];
  }

  async postMessage(message: Message): Promise<void> {
    const params = {
      TableName: MESSAGES_TABLE_NAME,
      Item: message,
    };
    await this.dynamoDb.put(params).promise();
  }

  async listMessagesByBoard(boardId: string): Promise<Message[]> {
    const params = {
      TableName: MESSAGES_TABLE_NAME,
      KeyConditionExpression: "boardId = :boardId",
      ExpressionAttributeValues: {
        ":boardId": boardId,
      },
    };
    const result = await this.dynamoDb.query(params).promise();
    return result.Items as Message[];
  }
}
