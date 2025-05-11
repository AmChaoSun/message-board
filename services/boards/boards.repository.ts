import { Board, Message } from "./boards.interface";

export interface BoardsRepository {
  createBoard(board: Board): Promise<void>;
  listAllBoards(): Promise<Board[]>;
  //   getBoardById(boardId: string): Promise<Board | null>;
  //   listBoardsByUser(userId: string): Promise<Board[]>;
  //   deleteBoard(boardId: string): Promise<void>;

  postMessage(message: Message): Promise<void>;
  listMessagesByBoard(boardId: string): Promise<Message[]>;
}
