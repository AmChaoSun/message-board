import { v4 as uuidv4 } from "uuid";
import { User } from "./users.interface";
import { UsersRepository } from "./users.repository";
import { SNS } from "aws-sdk";
import { USER_REGISTRATION_TOPIC_ARN } from "./users.constants";
import { DuplicateUserError } from "./users.errors";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sns: SNS
  ) {}

  async registerUser(name: string, email: string): Promise<void> {
    const existingByEmail = await this.usersRepository.getUserByEmail(email);
    if (existingByEmail) {
      throw new DuplicateUserError("Email already registered");
    }

    const user: Partial<User> = {
      name,
      email,
    };

    // Publish to SNS
    await this.sns
      .publish({
        Message: JSON.stringify(user),
        TopicArn: USER_REGISTRATION_TOPIC_ARN,
      })
      .promise();

    console.log(
      `User registration initiated and published to SNS: ${JSON.stringify(
        user
      )}`
    );
  }

  async saveUserToDb(name: string, email: string): Promise<User> {
    const user: User = {
      userId: uuidv4(),
      name,
      email,
    };
    return await this.usersRepository.createUser(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getUserByEmail(email);
  }
}
