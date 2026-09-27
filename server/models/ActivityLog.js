import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['Student', 'Sponsor', 'Admin'] },
  relatedId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
