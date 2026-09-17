import mongoose from 'mongoose';

const ruleTriggerSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  evidence: { type: String, required: true },
});

const fraudResultSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Application',
  },
  overallRisk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  rulesTriggered: [ruleTriggerSchema],
}, {
  timestamps: true,
});

const FraudResult = mongoose.model('FraudResult', fraudResultSchema);
export default FraudResult;

