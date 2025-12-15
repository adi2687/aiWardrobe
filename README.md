# 👔 OUTFIT_AI - Your AI-Powered Wardrobe Assistant

<div align="center">

![OUTFIT_AI Logo](frontend/public/logo_main.png)

**Transform your wardrobe with AI-powered fashion intelligence**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-blue?style=for-the-badge)](https://outfit-ai-liart.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Authentication](#-authentication)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 📖 Overview

Ever stood in front of your wardrobe thinking, **"I have nothing to wear"**? OUTFIT_AI is your intelligent wardrobe assistant that revolutionizes how you interact with your clothes. Powered by cutting-edge AI, computer vision, and machine learning, it helps you:

- **Discover** new outfit combinations from your existing wardrobe
- **Plan** outfits based on weather and occasions
- **Shop** smartly with price comparisons across platforms
- **Visualize** outfits on a 3D mannequin before wearing
- **Get** personalized style recommendations from an AI fashion assistant

---

## ✨ Features

### 🌦️ Weather-Based Recommendations
Get outfit suggestions perfectly suited to current and forecasted weather conditions in your location.
- Real-time weather data integration
- 7-day forecast outfit planning
- Seasonal wardrobe transitions

### 👕 Virtual Wardrobe Management
Upload and organize your entire clothing collection for effortless outfit planning and selection.
- Easy clothing categorization
- Image-based wardrobe inventory
- Smart organization system
- Drag-and-drop image upload
- Built-in image cropping tool

### 🎨 AI-Powered Outfit Mix & Match
Discover countless stylish combinations from your existing wardrobe with AI-powered suggestions.
- AI-driven style coordination
- Color and pattern matching
- Occasion-specific recommendations
- Personalized style learning

### 🛍️ Smart Shopping Integration
Shop for new clothing items that perfectly complement your existing wardrobe from top retailers.
- **Amazon** & **Myntra** product search and scraping
- Price comparison across platforms
- Wishlist and favorites management
- AI-powered shopping suggestions

### 🧍‍♂️ 3D Mannequin Preview
Visualize complete outfits on a virtual mannequin before deciding what to wear.
- Realistic 3D visualization using Three.js
- Rotate and view from all angles
- Try before you wear confidence
- AR preview capabilities

### 📅 Weekly Outfit Planner
Plan your outfits for the entire week in advance, saving time and reducing daily decision fatigue.
- Calendar integration
- Event-specific outfit planning
- Automatic weather adaptation

### 📤 Social Sharing
Share your favorite outfits with friends and get feedback on your style choices.
- One-click outfit sharing
- Share to WhatsApp, Twitter, Facebook, Instagram, and Email
- Download images with watermarks
- Style community integration

### 🤖 AI Fashion Assistant
Chat with our intelligent assistant for style advice, fashion tips, and trend information.
- 24/7 fashion advice
- Trend analysis and recommendations
- Personal styling questions answered
- Natural language processing

### ✂️ Image Editing Tools
Upload and edit your photos with built-in cropping tools for perfect wardrobe images.
- Easy image cropping tool
- Drag to select crop area
- Real-time preview
- Support for PNG, JPG up to 10MB

### 🎯 Pinterest Integration
Generate AI-powered outfit suggestions from Pinterest images.
- Upload images or use Pinterest URLs
- AI-powered clothing identification
- Virtual try-on generation
- Share generated outfits

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** with Vite - Modern UI framework
- **CSS3** - Custom styling with dark theme
- **Three.js** - 3D mannequin visualization
- **Socket.io Client** - Real-time features
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for session management
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage

### AI & Machine Learning
- **OpenAI GPT-4** - Natural language processing for chat assistant
- **Google Generative AI (Gemini)** - Image generation and analysis
- **Google Cloud Vision API** - Computer vision for clothing recognition
- **OpenRouter** - AI model routing
- **Cheerio** - Web scraping for Amazon & Myntra

### DevOps & Deployment
- **Vercel** - Frontend and backend hosting
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Image CDN
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MongoDB** - Local installation or MongoDB Atlas account
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adi2687/aiWardrobe.git
   cd aiWardrobe
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Create `.env` files in both `backend` and `frontend` directories.

#### Backend `.env` (Required Variables)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/aiwardrobe
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aiwardrobe

# Session & Security
SESSION_SECRET=your-super-secret-session-key-here

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET_KEY=your-cloudinary-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Google Generative AI (Gemini)
GOOGLE_GEN_AI_API_KEY=your-google-gen-ai-api-key

# Email Service (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Amazon/Myntra Scraping
AMAZON_API_KEY=your-amazon-api-key (optional)
SERP_API_KEY=your-serp-api-key (optional)
```

#### Frontend `.env` (Required Variables)

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# Optional: Analytics or other frontend services
VITE_APP_NAME=OUTFIT_AI
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   # On macOS/Linux
   mongod
   
   # On Windows
   # Start MongoDB service from Services panel
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   # Or: nodemon api/app.js
   ```
   Backend will run on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

---

## 📁 Project Structure

```
aiWardrobe/
├── backend/
│   ├── api/
│   │   └── app.js              # Main Express server
│   ├── db/
│   │   ├── connection.js       # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary configuration
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── model/                  # Mongoose models
│   │   ├── user.js
│   │   ├── cloth.js
│   │   ├── chatmessage.js
│   │   └── ...
│   ├── routes/                 # API routes
│   │   ├── auth_routes.js      # Authentication
│   │   ├── user_routes.js      # User management
│   │   ├── pinterestgenerate.js # Pinterest AI generation
│   │   ├── amazon.js           # Amazon scraping
│   │   ├── myntra.js           # Myntra scraping
│   │   ├── chat.js             # AI chat assistant
│   │   └── ...
│   ├── utils/
│   │   ├── emailService.js     # Email utilities
│   │   └── tokenHelper.js      # JWT utilities
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Home/
│   │   │   ├── Wardrobe/
│   │   │   ├── Shop/
│   │   │   ├── Pinterest/
│   │   │   ├── Chatbot/
│   │   │   └── ...
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── utils/
│   │       └── auth.js         # Frontend auth utilities
│   ├── public/                # Static assets
│   ├── package.json
│   └── vite.config.js         # Vite configuration
│
├── ML/                        # Machine learning scripts
│   ├── amazon_test.py
│   └── myntra.py
│
├── README.md                  # This file
├── FEATURES.md                # Detailed features list
└── ROUTES_DIAGRAM.html        # Interactive route diagram
```

---

## 📡 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/google` - Google OAuth login
- `GET /auth/facebook` - Facebook OAuth login
- `POST /auth/reset-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password with token

### User Endpoints

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/avatar` - Upload user avatar
- `GET /user/wardrobe` - Get user's wardrobe items

### Wardrobe & Outfits

- `POST /uploadselfimages` - Upload clothing images
- `GET /getselfimages` - Get user's clothing images
- `POST /pinterestgenerate/identify` - Identify clothing from Pinterest image
- `POST /pinterestgenerate/apply` - Generate virtual try-on

### Shopping

- `GET /amazon?clothes={query}` - Search Amazon products
- `GET /myntra?clothes={query}` - Search Myntra products
- `GET /shop/suggestions` - Get AI shopping suggestions

### AI Features

- `POST /chat` - Chat with AI fashion assistant
- `POST /generate-image` - Generate AI images
- `GET /gemini-test/*` - Test Gemini API endpoints

### Social & Sharing

- `POST /share` - Share outfit
- `GET /share/:id` - Get shared outfit
- `POST /sharetosocial` - Share to social media

For a complete API reference, see [ROUTES_DIAGRAM.html](ROUTES_DIAGRAM.html)

---

## 🚀 Deployment

### Deploying to Vercel

#### Backend Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from backend directory**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set environment variables in Vercel Dashboard**
   - Go to your project settings
   - Add all environment variables from `.env`

#### Frontend Deployment

1. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Update backend URL**
   - Set `VITE_BACKEND_URL` to your deployed backend URL

### Environment Variables for Production

Ensure all environment variables are set in your Vercel project settings:
- MongoDB Atlas connection string
- Cloudinary credentials
- OAuth credentials
- API keys

---

## 🔐 Authentication

OUTFIT_AI supports multiple authentication methods:

### Email/Password
- Secure registration and login
- Password reset via email
- JWT token-based sessions

### Google OAuth
- One-click Google sign-in
- Automatic profile creation
- Secure token management

### Facebook OAuth
- Facebook social login
- Profile data integration
- Privacy-compliant

All authentication methods use secure JWT tokens and encrypted sessions.

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- **Check MongoDB connection**: Ensure MongoDB is running or MongoDB Atlas connection string is correct
- **Check environment variables**: Verify all required `.env` variables are set
- **Check port availability**: Ensure port 5000 is not in use

#### Frontend can't connect to backend
- **Check CORS settings**: Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- **Check backend URL**: Verify `VITE_BACKEND_URL` in frontend `.env` is correct
- **Check backend is running**: Ensure backend server is started

#### Image upload fails
- **Check Cloudinary credentials**: Verify Cloudinary environment variables
- **Check file size**: Ensure images are under 10MB
- **Check file format**: Only PNG and JPG are supported

#### Myntra/Amazon scraping returns errors
- **Check network**: Ensure backend has internet access
- **Check timeout**: Scraping may take time, check Vercel timeout limits (10s)
- **Check API keys**: If using API keys, verify they're set correctly

#### Authentication issues
- **Check OAuth credentials**: Verify Google/Facebook OAuth credentials
- **Check session secret**: Ensure `SESSION_SECRET` is set
- **Clear cookies**: Try clearing browser cookies and localStorage

### Getting Help

If you encounter issues not listed here:
1. Check the [Issues](https://github.com/adi2687/aiWardrobe/issues) page
2. Review error logs in browser console and server logs
3. Contact support at [adityakurani26@gmail.com](mailto:adityakurani26@gmail.com)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 👨‍💻 Contributors

- **Aditya Kurani** - Project Lead & Developer
- **Paras Rana** - Co-developer
- **Mohit Bhalotia** - Launch Support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Email**: [adityakurani26@gmail.com](mailto:adityakurani26@gmail.com)
- **Live Demo**: [https://outfit-ai-liart.vercel.app/](https://outfit-ai-liart.vercel.app/)
- **Mobile App**: [Download Page](https://expo.dev/accounts/nareshmahiya/projects/Outfitai/builds/164668d2-6251-456e-8436-3c7fc70f229b)

---

## 🌟 Acknowledgments

- OpenAI for GPT-4 API
- Google for Gemini AI and Vision API
- Three.js community for 3D visualization tools
- All open-source contributors

---

<div align="center">

**Stay stylish. Stay smart with OUTFIT_AI.** 👔✨

Made with ❤️ by the OUTFIT_AI Team

</div>
