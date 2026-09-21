import { asyncHandler } from '../utils/asyncHandler';
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
router.get('/me', authenticate, authorize('student'), asyncHandler(getMyRegistrations));
router.get('/:eventId/status', authenticate, asyncHandler(checkRegistration));
router.post('/:eventId', authenticate, authorize('student'), asyncHandler(registerForEvent));
router.delete('/:eventId', authenticate, authorize('student'), asyncHandler(cancelRegistration));

export default router;
