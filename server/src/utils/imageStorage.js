"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = saveImage;
exports.removeImage = removeImage;
exports.serveImage = serveImage;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const Image = mongoose_1.default.model('EventImage', new mongoose_1.Schema({
    _id: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
}));
// Small event posters use the existing database, avoiding a new storage account.
async function saveImage(file) {
    const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
    const name = (0, uuid_1.v4)() + extensions[file.mimetype];
    await Image.create({ _id: name, contentType: file.mimetype, data: file.buffer });
    return `events/${name}`;
}
async function removeImage(imagePath) {
    if (imagePath?.startsWith('events/'))
        await Image.deleteOne({ _id: imagePath.slice(7) });
    // Existing bundled files stay intact; deployment files are read-only.
}
async function serveImage(req, res, next) {
    try {
        const image = await Image.findById(req.params.filename);
        if (!image) {
            next();
            return;
        }
        res.setHeader('Content-Type', image.contentType);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(image.data);
    }
    catch (error) {
        next(error);
    }
}
