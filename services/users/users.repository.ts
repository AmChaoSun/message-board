import { User } from "./users.interface";

export interface UsersRepository {
  createUser(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
}
