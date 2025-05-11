export interface Board {
  boardId: string;
  name: string;
  ownerId: string; // User ID who created the board
  createdAt: string;
  messages?: Message[]; // Optional field to include messages
}

export interface Message {
  messageId: string;
  boardId: string;
  userId: string;
  content: string;
  createdAt: string;
}
