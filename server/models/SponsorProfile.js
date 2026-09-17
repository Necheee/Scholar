import mongoose from 'mongoose';

const sponsorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  organizationName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  website: {
    type: String,
  },
}, {
  timestamps: true,
});

const SponsorProfile = mongoose.model('SponsorProfile', sponsorProfileSchema);
export default SponsorProfile;

