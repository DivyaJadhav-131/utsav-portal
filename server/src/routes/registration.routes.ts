import { Router } from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  checkRegistration,
} from '../controllers/registration.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Order matters: /me must come before /:eventId
router.get('/me', authenticate, authorize('student'), getMyRegistrations);
router.get('/:eventId/status', authenticate, checkRegistration);
router.post('/:eventId', authenticate, authorize('student'), registerForEvent);
router.delete('/:eventId', authenticate, authorize('student'), cancelRegistration);

export default router;
