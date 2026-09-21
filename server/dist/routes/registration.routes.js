"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("../utils/asyncHandler");
const express_1 = require("express");
const registration_controller_1 = require("../controllers/registration.controller");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
// Order matters: /me must come before /:eventId
router.get('/me', authenticate_1.authenticate, (0, authorize_1.authorize)('student'), (0, asyncHandler_1.asyncHandler)(registration_controller_1.getMyRegistrations));
router.get('/:eventId/status', authenticate_1.authenticate, (0, asyncHandler_1.asyncHandler)(registration_controller_1.checkRegistration));
router.post('/:eventId', authenticate_1.authenticate, (0, authorize_1.authorize)('student'), (0, asyncHandler_1.asyncHandler)(registration_controller_1.registerForEvent));
router.delete('/:eventId', authenticate_1.authenticate, (0, authorize_1.authorize)('student'), (0, asyncHandler_1.asyncHandler)(registration_controller_1.cancelRegistration));
exports.default = router;
