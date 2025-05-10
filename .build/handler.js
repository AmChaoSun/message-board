"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = exports.saveUserToDynamoDB = exports.registerUser = exports.helloWorld = void 0;
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = require("aws-sdk");
const env_1 = require("./env");
const uuid_1 = require("uuid");
const sns = new aws_sdk_1.SNS({
    endpoint: env_1.ENV.SNS_ENDPOINT,
    region: env_1.ENV.REGION,
});
const dynamoDb = new aws_sdk_2.DynamoDB.DocumentClient({
    endpoint: env_1.ENV.DYNAMODB_ENDPOINT,
    region: env_1.ENV.REGION,
});
const USER_TABLE = env_1.ENV.USER_TABLE;
const SNS_TOPIC_ARN = env_1.ENV.SNS_TOPIC_ARN;
const helloWorld = async (event) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Hello, World!" }),
    };
};
exports.helloWorld = helloWorld;
const registerUser = async (event) => {
    const { name, email } = JSON.parse(event.body);
    // Create user data without userId
    const userData = {
        name,
        email,
    };
    // Publish to Local SNS
    await sns
        .publish({
        Message: JSON.stringify(userData),
        TopicArn: SNS_TOPIC_ARN,
    })
        .promise();
    console.log(`User registered and published to SNS: ${JSON.stringify(userData)}`);
    return {
        statusCode: 202,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "User registration initiated locally." }),
    };
};
exports.registerUser = registerUser;
const saveUserToDynamoDB = async (event) => {
    console.log("Received SNS event:", JSON.stringify(event));
    for (const record of event.Records) {
        const userData = JSON.parse(record.Sns.Message);
        // Generate UUID for userId
        const userId = (0, uuid_1.v4)();
        const userItem = {
            ...userData,
            userId,
        };
        const params = {
            TableName: USER_TABLE,
            Item: userItem,
        };
        try {
            await dynamoDb.put(params).promise();
            console.log(`User ${userId} saved successfully to DynamoDB`);
        }
        catch (error) {
            console.error("Error saving user to DynamoDB:", error);
        }
    }
};
exports.saveUserToDynamoDB = saveUserToDynamoDB;
const getUserByEmail = async (event) => {
    const { email } = event.queryStringParameters;
    const params = {
        TableName: USER_TABLE,
        Key: {
            email,
        },
    };
    const result = await dynamoDb.get(params).promise();
    if (!result.Item) {
        return {
            statusCode: 404,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "User not found" }),
        };
    }
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(result.Item),
    };
};
exports.getUserByEmail = getUserByEmail;
//# sourceMappingURL=handler.js.map