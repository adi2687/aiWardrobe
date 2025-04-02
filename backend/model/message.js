// models/messageModel.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
        type: String,
      required: true,
    },
    recipient: {
      type:String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true, 
  }
);

const message = mongoose.model("Message", messageSchema);
export default message