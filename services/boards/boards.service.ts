import { v4 as uuidv4 } from "uuid";
import { Board, Message } from "./boards.interface";
import { BoardsRepository } from "./boards.repository";
import { SNS, SQS } from "aws-sdk";
import {
  BOARD_CREATION_QUEUE_URL,
  MESSAGE_POSTING_TOPIC_ARN,
} from "./boards.constants";

export class BoardsService {
  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly sqs: SQS,
    private readonly sns: SNS
  ) {}

  async listAllBoards(includeMessages: boolean): Promise<Board[]> {
    const boards = await this.boardsRepository.listAllBoards();

    if (includeMessages) {
      for (const board of boards) {
        const messages = await this.boardsRepository.listMessagesByBoard(
          board.boardId
        );
        board.messages = messages;
      }
    }
    return boards;
  }

  async createBoard(name: string, ownerId: string): Promise<void> {
    const board: Board = {
      boardId: uuidv4(),
      name,
      ownerId,
      createdAt: new Date().toISOString(),
    };

    await this.sqs
      .sendMessage({
        QueueUrl: BOARD_CREATION_QUEUE_URL,
        MessageBody: JSON.stringify(board),
      })
      .promise();
  }

  async saveBoardToDb(boardData: Board): Promise<void> {
    await this.boardsRepository.createBoard(boardData);
    console.log(`Board ${boardData.boardId} saved successfully to DynamoDB`);
  }

  async postMessage(
    boardId: string,
    userId: string,
    content: string
  ): Promise<void> {
    const message: Message = {
      messageId: uuidv4(),
      boardId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };

    await this.sns
      .publish({
        Message: JSON.stringify(message),
        TopicArn: MESSAGE_POSTING_TOPIC_ARN,
      })
      .promise();

    console.log(`Message ${message.messageId} published to SNS`);
  }

  async saveMessageToDb(messageData: Message): Promise<void> {
    await this.boardsRepository.postMessage(messageData);
    console.log(
      `Message ${messageData.messageId} saved successfully to DynamoDB`
    );
  }
}
