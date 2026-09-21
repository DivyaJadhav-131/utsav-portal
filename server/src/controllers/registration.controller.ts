import { Response } from 'express';
import Registration from '../models/Registration';
import Event from '../models/Event';
import { AuthRequest } from '../middleware/authenticate';

export const registerForEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { eventId } = req.params;
  const studentId = req.user!.userId;

  const event = await Event.findById(eventId);
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
    const count = await Registration.countDocuments({ event: eventId });
    if (count >= event.capacity) {
      res.status(400).json({ message: 'This event has reached its maximum capacity' });
      return;
    }
  }

  try {
    const registration = await Registration.create({
      event: eventId,
      student: studentId,
    });
    res.status(201).json(registration);
  } catch (err) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      res.status(409).json({ message: 'You are already registered for this event' });
      return;
    }
    throw err;
  }
};

export const cancelRegistration = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { eventId } = req.params;
  const studentId = req.user!.userId;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  if (new Date() >= event.dateTime) {
    res.status(400).json({ message: 'Cannot cancel registration after the event has started' });
    return;
  }

  const deleted = await Registration.findOneAndDelete({
    event: eventId,
    student: studentId,
  });
  if (!deleted) {
    res.status(404).json({ message: 'Registration not found' });
    return;
  }
  res.json({ message: 'Registration cancelled successfully' });
};

export const getMyRegistrations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const registrations = await Registration.find({ student: req.user!.userId })
    .populate('event', 'title dateTime venue imagePath organizerName capacity')
    .sort({ registeredAt: -1 });
  res.json(registrations);
};

export const checkRegistration = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { eventId } = req.params;
  const reg = await Registration.findOne({
    event: eventId,
    student: req.user!.userId,
  });
  res.json({ registered: !!reg });
};
