import { Request, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/authenticate';
import { saveImage, removeImage } from '../utils/imageStorage';
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
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }
  const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;
  const imagePath = req.file ? await saveImage(req.file) : null;

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
  }).catch(async error => {
    await removeImage(imagePath).catch(() => undefined);
    throw error;
  });

  res.status(201).json(event);
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: result.error.errors[0].message });
    return;
  }

  const { title, description, dateTime, venue, organizerName, capacity, department } = result.data;

  const previousImage = event.imagePath;
  if (req.file) event.imagePath = await saveImage(req.file);

  if (department !== undefined) event.department = department;
  event.title = title;
  event.description = description;
  event.dateTime = new Date(dateTime);
  event.venue = venue;
  event.organizerName = organizerName;
  event.capacity = capacity ?? null;

  try { await event.save(); }
  catch (error) {
    if (req.file) await removeImage(event.imagePath).catch(() => undefined);
    throw error;
  }
  if (req.file) await removeImage(previousImage).catch(() => undefined);
  res.json(event);
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  await Registration.deleteMany({ event: event._id });
  await event.deleteOne();
  await removeImage(event.imagePath).catch(() => undefined);
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
