import express from 'express';
import User from '../model/user.js';
import message from '../model/message.js';
import jwt from 'jsonwebtoken';
import process from 'process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Avatar from '../model/avatar.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temporary directory for processing files if needed
let tempDir;
try {
  tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  console.log('Temporary directory created at:', tempDir);
} catch (error) {
  console.warn('Could not create temp directory:', error.message);
  // In serverless environments, we'll use memory buffers instead of file system
  tempDir = null;
}

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin 
  if(!token){
    console.log("no token in ar path")
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    req.user = decoded
    console.log('user is ', req.user)
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}
// Get user's avatar data from MongoDB and Cloudinary
router.get('/avatar', authenticate, async (req, res) => {
  console.log('Fetching avatar data for user');
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get detailed avatar information from the Avatar model
    const avatarData = await Avatar.findOne({ userId });
    
    res.json({ 
      avatarUrl: user.avatarUrl || null,
      avatarCloudinaryUrl: user.avatarCloudinaryUrl || null,
      avatarDetails: avatarData || null
    });
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save user's avatar URL and upload the GLB model to Cloudinary
router.post('/save-avatar', authenticate, async (req, res) => {
  console.log("in the save ", req.body);
  try {
    const userId = req.user.id;
    const username = req.user.username;
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Store the original URL for reference
    user.avatarUrl = avatarUrl;
    
    try {
      // Download the GLB file
      const response = await axios({
        method: 'GET',
        url: avatarUrl,
        responseType: 'arraybuffer' // Use arraybuffer to get binary data
      });
      
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'avatars',
            resource_type: 'raw', // Important for binary files like GLB
            public_id: `avatar_${userId}_${Date.now()}`,
            format: 'glb'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Convert arraybuffer to stream and pipe to Cloudinary
        streamifier.createReadStream(response.data).pipe(uploadStream);
      });
      
      console.log('Cloudinary upload result:', uploadResult);
      
      // Create or update avatar document in MongoDB
      let avatar = await Avatar.findOne({ userId });
      console.log('Looking for existing avatar for user:', userId);
      
      if (!avatar) {
        // Create new avatar document
        avatar = new Avatar({
          userId,
          username,
          originalUrl: avatarUrl,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          metadata: {
            format: uploadResult.format,
            resourceType: uploadResult.resource_type,
            bytes: uploadResult.bytes,
            createdAt: new Date()
          }
        });
      } else {
        // Update existing avatar document
        avatar.originalUrl = avatarUrl;
        avatar.cloudinaryUrl = uploadResult.secure_url;
        avatar.cloudinaryPublicId = uploadResult.public_id;
        avatar.metadata = {
          format: uploadResult.format,
          resourceType: uploadResult.resource_type,
          bytes: uploadResult.bytes,
          updatedAt: new Date()
        };
      }
      
      await avatar.save();
      console.log('Avatar document saved to MongoDB:', avatar._id);
      
      // Update user with reference to Cloudinary URL
      user.avatarCloudinaryUrl = uploadResult.secure_url;
      await user.save();
      console.log('User document updated with Cloudinary URL');
      
      res.json({ 
        success: true, 
        message: 'Avatar saved successfully to Cloudinary and MongoDB',
        avatarUrl: user.avatarUrl,
        avatarCloudinaryUrl: user.avatarCloudinaryUrl,
        avatarDetails: {
          id: avatar._id,
          cloudinaryPublicId: avatar.cloudinaryPublicId,
          metadata: avatar.metadata
        }
      });
    } catch (uploadError) {
      console.error('Error uploading avatar to Cloudinary:', uploadError);
      // If upload fails, still save the URL but inform the client
      await user.save();
      res.json({ 
        success: true, 
        message: 'Avatar URL saved, but cloud upload failed',
        avatarUrl: user.avatarUrl,
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Error saving user avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
