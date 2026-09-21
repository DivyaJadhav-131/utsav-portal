import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), createEvent);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);
router.get('/:id/registrations', authenticate, authorize('admin'), getEventRegistrations);

export default router;
