import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRegistration extends Document {
  event: Types.ObjectId;
  student: Types.ObjectId;
  registeredAt: Date;
}

const registrationSchema = new Schema<IRegistration>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  registeredAt: { type: Date, default: Date.now },
});

// Prevent duplicate registrations at the database level
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.model<IRegistration>('Registration', registrationSchema);
