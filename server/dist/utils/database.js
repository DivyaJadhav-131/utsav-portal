"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
let connection;
function connectDatabase() {
    if (mongoose_1.default.connection.readyState === 1)
        return Promise.resolve(mongoose_1.default);
    if (!connection) {
        const uri = process.env.MONGODB_URI;
        if (!uri && process.env.NODE_ENV === 'production')
            throw new Error('MONGODB_URI is required');
        connection = mongoose_1.default.connect(uri || 'mongodb://127.0.0.1:27017/college_events', {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 5,
        }).catch(error => { connection = undefined; throw error; });
    }
    return connection;
}
