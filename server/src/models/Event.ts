import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEvent extends Document {
  department: string;
  title: string;
  description: string;
  dateTime: Date;
  venue: string;
  imagePath: string | null;
  capacity: number | null;
  organizerName: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    department: { type: String, enum: ['All departments', 'Computer', 'IT', 'AIDS', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'Instru'], default: 'All departments' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    dateTime: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    imagePath: { type: String, default: null },
    capacity: { type: Number, default: null },
    organizerName: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', eventSchema);
