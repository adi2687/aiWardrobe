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
import { Buffer } from 'buffer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temporary directory for processing files if nee

const router = express.Router();

// Add CORS headers to all responses
router.use((req, res, next) => {
  // When using credentials, we need to specify the exact origin instead of wildcard '*'
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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
  console.log("in the save-avatar endpoint", req.body);
  console.log("Request headers:", req.headers);
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
      console.log('Attempting to download GLB file from:', avatarUrl);
      const response = await axios({
        method: 'GET',
        url: avatarUrl,
        responseType: 'arraybuffer', // Use arraybuffer to get binary data
        timeout: 30000, // 30 second timeout
        headers: {
          'Accept': '*/*',
          'User-Agent': 'AI-Wardrobe-App'
        }
      });
      
      // Check file size
      const fileSizeInBytes = response.data.length;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      console.log('Successfully downloaded GLB file, size:', fileSizeInBytes, 'bytes (', fileSizeInMB.toFixed(2), 'MB)');
      
      // Check if file exceeds Cloudinary's free tier limit (10MB)
      let processedData = response.data;
      let compressionApplied = false;
      
      if (fileSizeInBytes > 10 * 1024 * 1024) {
        console.log('File exceeds Cloudinary size limit. Storing URL reference only.');
        // Store the URL reference in the user model
        user.avatarUrl = avatarUrl;
        await user.save();
        
        return res.json({
          success: true,
          message: 'Avatar URL saved. File too large for cloud storage.',
          avatarUrl: user.avatarUrl,
          fileSizeMB: fileSizeInMB.toFixed(2)
        });
      }
      
      // For files under the limit, we'll upload directly
      console.log('File size within limits, proceeding with upload.');
      
      // Upload to Cloudinary with optimization options
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'avatars',
            resource_type: 'raw', // Important for binary files like GLB
            public_id: `avatar_${userId}_${Date.now()}`,
            format: 'glb',
            quality: 'auto', // Use automatic quality
            fetch_format: 'auto', // Use automatic format
            flags: 'lossy', // Allow lossy compression if possible
            transformation: [
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload success, new size:', result.bytes, 'bytes');
              resolve(result);
            }
          }
        );
        
        // Convert arraybuffer to stream and pipe to Cloudinary
        streamifier.createReadStream(response.data).pipe(uploadStream);
      }).catch(error => {
        console.error('Cloudinary upload failed:', error.message);
        // If upload fails due to size limit, return a specific error
        if (error.message && error.message.includes('File size too large')) {
          throw new Error('File size exceeds Cloudinary plan limits. Please upgrade your plan or use smaller files.');
        }
        throw error;
      });
      
      console.log('Cloudinary upload result:', uploadResult);
      
      // Create or update avatar document in MongoDB
      let avatar = await Avatar.findOne({ userId });
      console.log('Looking for existing avatar for user:', userId);
      
      // Add metadata
      const metadata = {
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        bytes: uploadResult.bytes,
        originalBytes: fileSizeInBytes,
        updatedAt: new Date()
      };
      
      if (!avatar) {
        // Create new avatar document
        avatar = new Avatar({
          userId,
          username,
          originalUrl: avatarUrl,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          metadata: metadata
        });
      } else {
        // Update existing avatar document
        avatar.originalUrl = avatarUrl;
        avatar.cloudinaryUrl = uploadResult.secure_url;
        avatar.cloudinaryPublicId = uploadResult.public_id;
        avatar.metadata = metadata;
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
