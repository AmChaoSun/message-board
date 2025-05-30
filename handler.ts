export {
  registerUser,
  saveUserToDynamoDB,
  getUserByEmail,
} from "./services/users/users.events";
export {
  listAllBoards,
  createBoard,
  postMessage,
  saveBoardToDynamoDB,
  saveMessageToDynamoDB,
} from "./services/boards/boards.events";

export const helloWorld = async (event: any) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};
