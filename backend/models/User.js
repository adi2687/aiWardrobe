import mongoose from 'mongoose';

// Define sub-schemas
const colorSchema = new mongoose.Schema({
  red: Number,
  green: Number,
  blue: Number
}, { _id: false });

const labelSchema = new mongoose.Schema({
  description: String,
  confidence: Number
}, { _id: false });

const colorInfoSchema = new mongoose.Schema({
  color: colorSchema,
  score: Number,
  pixelFraction: Number
}, { _id: false });

const classificationSchema = new mongoose.Schema({
  types: [{
    type: String,
    confidence: Number,
    matchedLabels: [String]
  }],
  classifiedAt: Date
}, { _id: false });

const wardrobeItemSchema = new mongoose.Schema({
  imageUrl: String,
  publicId: String,
  originalName: String,
  format: String,
  size: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  labels: [labelSchema],
  colors: [colorInfoSchema],
  visionAnalysis: mongoose.Schema.Types.Mixed,
  classification: classificationSchema
}, { _id: true });

// Main user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    // required: true
  },
  wardrobe: {
    type: [wardrobeItemSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Delete existing model if it exists
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Create new model
const User = mongoose.model('User', userSchema);

export default User; 