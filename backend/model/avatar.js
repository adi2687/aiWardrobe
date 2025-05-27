import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  metadata: {
    format: String,
    resourceType: String,
    bytes: Number,
    createdAt: Date,
    updatedAt: Date
  },
  tryOnHistory: [{
    clothingItemId: String,
    timestamp: Date,
    resultImageUrl: String
  }]
}, { timestamps: true });

const Avatar = mongoose.model('Avatar', avatarSchema);

export default Avatar;
