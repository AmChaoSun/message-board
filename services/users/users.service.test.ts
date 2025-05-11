import { SNS } from "aws-sdk";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { DuplicateUserError } from "./users.errors";
import { User } from "./users.interface";

describe("UsersService", () => {
  let usersService: UsersService;
  let usersRepositoryMock: jest.Mocked<UsersRepository>;
  let snsMock: jest.Mocked<SNS>;

  beforeAll(() => {
    usersRepositoryMock = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    snsMock = {
      publish: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    } as unknown as jest.Mocked<SNS>;
  });

  beforeEach(() => {
    usersService = new UsersService(usersRepositoryMock, snsMock);
  });

  describe("registerUser", () => {
    it("should throw DuplicateUserError if email is already registered", async () => {
      usersRepositoryMock.getUserByEmail.mockResolvedValue({
        userId: "1",
        name: "John Doe",
        email: "john@example.com",
      });

      await expect(
        usersService.registerUser("John Doe", "john@example.com")
      ).rejects.toThrow(DuplicateUserError);

      expect(usersRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
    });

    it("should publish user data to SNS if email is not registered", async () => {
      usersRepositoryMock.getUserByEmail.mockResolvedValue(null);

      await usersService.registerUser("John Doe", "john@example.com");

      expect(snsMock.publish).toHaveBeenCalledWith({
        Message: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
        }),
        TopicArn: expect.any(String),
      });
      expect(snsMock.publish().promise).toHaveBeenCalled();
    });
  });

  describe("saveUserToDb", () => {
    it("should save a new user to the database", async () => {
      const mockUser: User = {
        userId: "123",
        name: "Jane Doe",
        email: "jane@example.com",
      };

      usersRepositoryMock.createUser.mockResolvedValue(mockUser);

      await usersService.saveUserToDb("Jane Doe", "jane@example.com");

      expect(usersRepositoryMock.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
        })
      );
    });
  });

  describe("findUserByEmail", () => {
    it("should return a user if found by email", async () => {
      const mockUser: User = {
        userId: "123",
        name: "Jane Doe",
        email: "jane@example.com",
      };

      usersRepositoryMock.getUserByEmail.mockResolvedValue(mockUser);

      const result = await usersService.findUserByEmail("jane@example.com");

      expect(result).toEqual(mockUser);
      expect(usersRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
        "jane@example.com"
      );
    });

    it("should return null if no user is found by email", async () => {
      usersRepositoryMock.getUserByEmail.mockResolvedValue(null);

      const result = await usersService.findUserByEmail("unknown@example.com");

      expect(result).toBeNull();
      expect(usersRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
        "unknown@example.com"
      );
    });
  });
});
