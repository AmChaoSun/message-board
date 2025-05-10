"use strict";
// This file is usually not upoaded as a .env locally
// Here use a env.ts for demonstration purposes
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
exports.ENV = {
    DYNAMODB_ENDPOINT: "http://localhost:8000",
    SNS_ENDPOINT: "http://localhost:4002",
    REGION: "ap-southeast-2",
    USER_TABLE: "UsersTable",
    SNS_TOPIC_ARN: "arn:aws:sns:ap-southeast-2:123456789012:UserRegistrationTopic",
};
//# sourceMappingURL=env.js.map