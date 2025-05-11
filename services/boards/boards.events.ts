import { SQS, SNS } from "aws-sdk";
import { DynamoDBBoardsRepository } from "./boards.dynamodb";
import { BoardsService } from "./boards.service";
import { ENV } from "../../env";

const sqs = new SQS({
  endpoint: ENV.SQS_ENDPOINT,
  region: ENV.REGION,
});

const sns = new SNS({
  endpoint: ENV.SNS_ENDPOINT,
  region: ENV.REGION,
});

const boardsRepository = new DynamoDBBoardsRepository();
const boardsService = new BoardsService(boardsRepository, sqs, sns);

export const listAllBoards = async (event: any) => {
  const includeMessages =
    event.queryStringParameters?.includeMessages === "true";

  const boards = await boardsService.listAllBoards(includeMessages);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boards),
  };
};

export const createBoard = async (event: any) => {
  const { name, ownerId } = JSON.parse(event.body);

  await boardsService.createBoard(name, ownerId);

  return {
    statusCode: 202,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Board creation initiated." }),
  };
};

export const postMessage = async (event: any) => {
  const { boardId, userId, content } = JSON.parse(event.body);

  await boardsService.postMessage(boardId, userId, content);

  return {
    statusCode: 202,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Message posting initiated." }),
  };
};

export const saveBoardToDynamoDB = async (event: any) => {
  console.log("Received SQS event:", JSON.stringify(event));

  for (const record of event.Records) {
    const boardData = JSON.parse(record.body);
    await boardsService.saveBoardToDb(boardData);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Board saved to DynamoDB." }),
  };
};

export const saveMessageToDynamoDB = async (event: any) => {
  console.log("Received SNS event:", JSON.stringify(event));

  for (const record of event.Records) {
    const messageData = JSON.parse(record.Sns.Message);
    await boardsService.saveMessageToDb(messageData);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Message saved to DynamoDB." }),
  };
};
