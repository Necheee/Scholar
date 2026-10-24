import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true, // stored in Naira (NGN)
  },
  currency: {
    type: String,
    default: 'NGN',
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  },
  paystackTransactionId: {
    type: String,
  },
  channel: {
    type: String,
    default: 'card',
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Application',
  },
  paidAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

