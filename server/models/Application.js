import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'Transcript', 'ID'
  cloudinaryUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
});

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  sponsorship: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Sponsorship',
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Under screening',
      'Under Admin review',
      'Waiting for additional information',
      'Under Sponsor review',
      'Approved',
      'Rejected'
    ],
    default: 'Draft',
  },
  academicInfoSnapshot: {
    session: { type: String },
    level: { type: String },
    programme: { type: String },
  },
  reasonForRequesting: {
    type: String,
  },
  documents: [documentSchema],
  fraudReviewStatus: {
    type: String,
    enum: ['Pending', 'Passed', 'Flagged'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
  }
}, {
  timestamps: true,
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;

