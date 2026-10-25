import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema({
  session: { type: String, required: true }, // e.g., '2025/2026'
  programme: { type: String, required: true },
  level: { type: String, required: true },
  info: { type: String }, // General academic performance or details
});

const bankDetailsSchema = new mongoose.Schema({
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountName: { type: String, default: '' },
});

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  institution: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  seekingSponsorship: {
    type: Boolean,
    default: false,
  },
  bankDetails: {
    type: bankDetailsSchema,
    default: () => ({}),
  },
  academicRecords: [academicRecordSchema],
}, {
  timestamps: true,
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;

