"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Delete a file stored under the uploads directory.
 * @param relativePath  e.g. "events/abc123.jpg"
 */
const deleteFile = (relativePath) => {
    if (!relativePath)
        return;
    const absolutePath = path_1.default.join(__dirname, '../../uploads', relativePath);
    if (fs_1.default.existsSync(absolutePath)) {
        fs_1.default.unlinkSync(absolutePath);
    }
};
exports.deleteFile = deleteFile;
