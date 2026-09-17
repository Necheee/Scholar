import mongoose from 'mongoose';

const sponsorshipSchema = new mongoose.Schema({
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibilityRequirements: {
    type: String,
    required: true,
  },
  academicRequirements: {
    type: String,
    required: true,
  },
  requiredDocuments: [{
    type: String,
  }],
  applicationDeadline: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  isLocked: {
    type: Boolean,
    default: false, // Becomes true after the first application is received
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active',
  }
}, {
  timestamps: true,
});

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);
export default Sponsorship;

