"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventRegistrations = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const Registration_1 = __importDefault(require("../models/Registration"));
const imageStorage_1 = require("../utils/imageStorage");
const event_validator_1 = require("../validators/event.validator");
const getEvents = async (req, res) => {
    const search = req.query.search;
    const filter = search
        ? { title: { $regex: search, $options: 'i' } }
        : {};
    const events = await Event_1.default.find(filter).sort({ dateTime: 1 });
    res.json(events);
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id);
    if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
    }
    res.json(event);
};
exports.getEventById = getEventById;
const createEvent = async (req, res) => {
    const result = event_validator_1.createEventSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: result.error.errors[0].message });
        return;
    }
    const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;
    const imagePath = req.file ? await (0, imageStorage_1.saveImage)(req.file) : null;
    const event = await Event_1.default.create({
        title,
        description,
        dateTime: new Date(dateTime),
        venue,
        organizerName,
        department,
        capacity: capacity ?? null,
        imagePath,
        createdBy: req.user.userId,
    }).catch(async (error) => {
        await (0, imageStorage_1.removeImage)(imagePath).catch(() => undefined);
        throw error;
    });
    res.status(201).json(event);
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id);
    if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
    }
    const result = event_validator_1.createEventSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: result.error.errors[0].message });
        return;
    }
    const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;
    const previousImage = event.imagePath;
    if (req.file)
        event.imagePath = await (0, imageStorage_1.saveImage)(req.file);
    if (department !== undefined)
        event.department = department;
    event.title = title;
    event.description = description;
    event.dateTime = new Date(dateTime);
    event.venue = venue;
    event.organizerName = organizerName;
    event.capacity = capacity ?? null;
    try {
        await event.save();
    }
    catch (error) {
        if (req.file)
            await (0, imageStorage_1.removeImage)(event.imagePath).catch(() => undefined);
        throw error;
    }
    if (req.file)
        await (0, imageStorage_1.removeImage)(previousImage).catch(() => undefined);
    res.json(event);
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    const event = await Event_1.default.findById(req.params.id);
    if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
    }
    await Registration_1.default.deleteMany({ event: event._id });
    await event.deleteOne();
    await (0, imageStorage_1.removeImage)(event.imagePath).catch(() => undefined);
    res.json({ message: 'Event deleted successfully' });
};
exports.deleteEvent = deleteEvent;
const getEventRegistrations = async (req, res) => {
    const registrations = await Registration_1.default.find({ event: req.params.id })
        .populate('student', 'name email')
        .sort({ registeredAt: -1 });
    res.json(registrations);
};
exports.getEventRegistrations = getEventRegistrations;
