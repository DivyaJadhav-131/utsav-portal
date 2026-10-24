"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRegistration = exports.getMyRegistrations = exports.cancelRegistration = exports.registerForEvent = void 0;
const Registration_1 = __importDefault(require("../models/Registration"));
const Event_1 = __importDefault(require("../models/Event"));
const registerForEvent = async (req, res) => {
    const { eventId } = req.params;
    const studentId = req.user.userId;
    const event = await Event_1.default.findById(eventId);
    if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
    }
    // Reject registrations after event has started
    if (new Date() >= event.dateTime) {
        res.status(400).json({ message: 'Registration is closed — event has already started' });
        return;
    }
    // Check capacity
    if (event.capacity !== null) {
        const count = await Registration_1.default.countDocuments({ event: eventId });
        if (count >= event.capacity) {
            res.status(400).json({ message: 'This event has reached its maximum capacity' });
            return;
        }
    }
    try {
        const registration = await Registration_1.default.create({
            event: eventId,
            student: studentId,
        });
        res.status(201).json(registration);
    }
    catch (err) {
        const mongoErr = err;
        if (mongoErr.code === 11000) {
            res.status(409).json({ message: 'You are already registered for this event' });
            return;
        }
        throw err;
    }
};
exports.registerForEvent = registerForEvent;
const cancelRegistration = async (req, res) => {
    const { eventId } = req.params;
    const studentId = req.user.userId;
    const event = await Event_1.default.findById(eventId);
    if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
    }
    if (new Date() >= event.dateTime) {
        res.status(400).json({ message: 'Cannot cancel registration after the event has started' });
        return;
    }
    const deleted = await Registration_1.default.findOneAndDelete({
        event: eventId,
        student: studentId,
    });
    if (!deleted) {
        res.status(404).json({ message: 'Registration not found' });
        return;
    }
    res.json({ message: 'Registration cancelled successfully' });
};
exports.cancelRegistration = cancelRegistration;
const getMyRegistrations = async (req, res) => {
    const registrations = await Registration_1.default.find({ student: req.user.userId })
        .populate('event', 'title dateTime venue imagePath organizerName capacity')
        .sort({ registeredAt: -1 });
    res.json(registrations);
};
exports.getMyRegistrations = getMyRegistrations;
const checkRegistration = async (req, res) => {
    const { eventId } = req.params;
    const reg = await Registration_1.default.findOne({
        event: eventId,
        student: req.user.userId,
    });
    res.json({ registered: !!reg });
};
exports.checkRegistration = checkRegistration;
