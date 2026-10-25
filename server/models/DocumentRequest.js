import mongoose from 'mongoose';

const submittedDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryId: { type: String },
  fileHash: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const documentRequestSchema = new mongoose.Schema({
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sponsorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsorship',
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  requestedDocuments: [{
    type: String,
    required: true,
  }],
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Fulfilled', 'Closed'],
    default: 'Pending',
  },
  studentNote: {
    type: String,
  },
  submittedDocuments: [submittedDocumentSchema],
  submittedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);
export default DocumentRequest;
