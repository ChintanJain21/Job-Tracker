import mongoose, { Schema, model, models } from 'mongoose';

const JobSchema = new Schema(
  {
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    dateApplied: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer Received', 'Rejected'],
      default: 'Applied',
    },
  },
  { timestamps: true }
);

const Job = models.Job || model('Job', JobSchema);

export default Job;
