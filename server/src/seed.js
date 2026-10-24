"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seed script — creates a default admin account.
 * Run with: npm run seed
 *
 * Default credentials:
 *   Email:    admin@college.edu
 *   Password: Admin@1234
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("./models/User"));
const seed = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events';
    await mongoose_1.default.connect(uri);
    console.log('Connected to MongoDB');
    const adminEmail = 'admin@college.edu';
    const existing = await User_1.default.findOne({ email: adminEmail });
    if (existing) {
        console.log(`Admin already exists: ${adminEmail}`);
    }
    else {
        const passwordHash = await bcrypt_1.default.hash('Admin@1234', 12);
        await User_1.default.create({
            name: 'Admin',
            email: adminEmail,
            passwordHash,
            role: 'admin',
        });
        console.log(`✅ Admin created — Email: ${adminEmail}  Password: Admin@1234`);
    }
    await mongoose_1.default.disconnect();
    process.exit(0);
};
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
