"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    department: zod_1.z.enum(['All departments', 'Computer', 'IT', 'AIDS', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Instru']).optional(),
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    dateTime: zod_1.z
        .string()
        .min(1, 'Date and time is required')
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid date/time value'),
    venue: zod_1.z.string().min(2, 'Venue must be at least 2 characters'),
    organizerName: zod_1.z.string().min(2, 'Organizer name must be at least 2 characters'),
    // capacity comes as a form string field
    capacity: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (!val || val.trim() === '')
            return null;
        const n = parseInt(val, 10);
        return isNaN(n) || n < 1 ? null : n;
    }),
});
