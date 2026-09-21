import { Request, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/authenticate';
import { deleteFile } from '../utils/fileCleanup';
import { createEventSchema } from '../validators/event.validator';

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string | undefined;
  const filter = search
    ? { title: { $regex: search, $options: 'i' } }
    : {};
  const events = await Event.find(filter).sort({ dateTime: 1 });
  res.json(events);
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  res.json(event);
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    if (req.file) deleteFile(`events/${req.file.filename}`);
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }
  const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;
  const imagePath = req.file ? `events/${req.file.filename}` : null;

  const event = await Event.create({
    title,
    description,
    dateTime: new Date(dateTime),
    venue,
    organizerName,
    department,
    capacity: capacity ?? null,
    imagePath,
    createdBy: req.user!.userId,
  });

  res.status(201).json(event);
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    if (req.file) deleteFile(`events/${req.file.filename}`);
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    if (req.file) deleteFile(`events/${req.file.filename}`);
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }

  const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;

  // Replace image if a new one was uploaded, deleting the old file
  if (req.file) {
    deleteFile(event.imagePath);
    event.imagePath = `events/${req.file.filename}`;
  }

  if (department !== undefined) event.department = department;
  event.title = title;
  event.description = description;
  event.dateTime = new Date(dateTime);
  event.venue = venue;
  event.organizerName = organizerName;
  event.capacity = capacity ?? null;

  await event.save();
  res.json(event);
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  deleteFile(event.imagePath);
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: 'Event deleted successfully' });
};

export const getEventRegistrations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const registrations = await Registration.find({ event: req.params.id })
    .populate('student', 'name email')
    .sort({ registeredAt: -1 });
  res.json(registrations);
};
