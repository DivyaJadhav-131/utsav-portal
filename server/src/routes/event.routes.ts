import { asyncHandler } from '../utils/asyncHandler';
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

router.get('/', asyncHandler(getEvents));
router.get('/:id', asyncHandler(getEventById));
router.post('/', authenticate, authorize('admin'), upload.single('image'), asyncHandler(createEvent));
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), asyncHandler(updateEvent));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(deleteEvent));
router.get('/:id/registrations', authenticate, authorize('admin'), asyncHandler(getEventRegistrations));

export default router;
