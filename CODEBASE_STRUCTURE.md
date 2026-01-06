# OUTFIT_AI - Complete Codebase Structure

## 📁 Project Structure

```
aiWardrobe/
│
├── 📂 backend/                          # Node.js/Express Backend
│   ├── 📂 api/
│   │   └── app.js                      # Main Express server & Socket.io setup
│   │
│   ├── 📂 db/
│   │   ├── connection.js               # MongoDB connection with retry logic
│   │   └── cloudinary.js               # Cloudinary configuration
│   │
│   ├── 📂 middleware/
│   │   └── auth.js                     # Authentication middleware
│   │
│   ├── 📂 model/                       # Mongoose Data Models
│   │   ├── user.js                    # User schema (wardrobe, preferences, avatar)
│   │   ├── cloth.js                   # Clothing items for marketplace
│   │   ├── chatmessage.js             # AI chat message history
│   │   ├── outfit-preview.js         # Shared outfit previews
│   │   ├── Sharecloths.js            # Shared clothing combinations
│   │   ├── sharecollection.js        # Social outfit collections
│   │   ├── addtowishlist.js          # Wishlist items
│   │   ├── avatar.js                 # 3D avatar data
│   │   └── message.js                # User-to-user messages
│   │
│   ├── 📂 routes/                      # API Route Handlers
│   │   ├── auth_routes.js             # Email/password auth
│   │   ├── auth.google.js             # Google OAuth
│   │   ├── auth.facebook.js           # Facebook OAuth
│   │   ├── password_reset.js          # Password reset flow
│   │   ├── user_routes.js             # User profile & wardrobe management
│   │   ├── user_avatar.js             # 3D avatar management
│   │   ├── chat.js                    # AI chatbot endpoints
│   │   ├── shop.routes.js             # Shopping & wishlist
│   │   ├── amazon.js                  # Amazon product scraping
│   │   ├── myntra.js                  # Myntra product scraping
│   │   ├── uploadselfimages.js        # Self-image upload
│   │   ├── getselfimages.js           # Get user self-images
│   │   ├── clothid.js                # Clothing identification
│   │   ├── menuimages.js              # Menu image management
│   │   ├── dewfaultimage.js           # Default image handling
│   │   ├── pinterestgenerate.js       # Pinterest AI generation
│   │   ├── pinterset.js               # Pinterest set operations
│   │   ├── share.js                   # Outfit sharing
│   │   ├── sharetosocial.js           # Social media sharing
│   │   ├── watermark.js               # Image watermarking
│   │   ├── generate-image.js         # AI image generation
│   │   ├── image.js                   # Image processing
│   │   └── gemini-test.js            # Gemini API testing
│   │
│   ├── 📂 utils/
│   │   ├── emailService.js            # Email sending utilities
│   │   └── tokenHelper.js             # JWT token utilities
│   │
│   ├── 📂 public/
│   │   ├── login.html                 # Login page
│   │   └── register.html              # Registration page
│   │
│   ├── package.json                   # Backend dependencies
│   ├── vercel.json                    # Vercel deployment config
│   └── status-check.html             # Health check page
│
├── 📂 frontend/                        # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 AR/                 # AR & 3D Avatar Components
│   │   │   │   ├── main.jsx
│   │   │   │   ├── AR_try.jsx
│   │   │   │   └── SavedAvatar.jsx
│   │   │   │
│   │   │   ├── 📂 Auth/               # Authentication Components
│   │   │   │   ├── Auth.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   │
│   │   │   ├── 📂 Chatbot/            # AI Chatbot Interface
│   │   │   │   └── Chatbot.jsx
│   │   │   │
│   │   │   ├── 📂 ChatButton/         # Chat Button Component
│   │   │   │   └── ChatButton.jsx
│   │   │   │
│   │   │   ├── 📂 Developers/         # About/Developer Pages
│   │   │   │   ├── Developers.jsx
│   │   │   │   └── Aboutus.jsx
│   │   │   │
│   │   │   ├── 📂 DiscoverTrends/     # Trend Discovery
│   │   │   │   └── DiscoverTrends.jsx
│   │   │   │
│   │   │   ├── 📂 dock/               # Dock Navigation
│   │   │   │   └── export.jsx
│   │   │   │
│   │   │   ├── 📂 Download/           # Download Features
│   │   │   │   └── Download.jsx
│   │   │   │
│   │   │   ├── 📂 FloatingNavbar/     # Floating Navigation
│   │   │   │   └── FloatingNavbar.jsx
│   │   │   │
│   │   │   ├── 📂 Footer/             # Footer Component
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   ├── 📂 Home/                # Home Page Variants
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Home3.jsx
│   │   │   │   ├── Home4.jsx
│   │   │   │   ├── Home5.jsx
│   │   │   │   └── Homemain.jsx
│   │   │   │
│   │   │   ├── 📂 Homepage/           # Main Homepage
│   │   │   │   └── Homepage.jsx
│   │   │   │
│   │   │   ├── 📂 Image/              # Image Components
│   │   │   │   └── Image.jsx
│   │   │   │
│   │   │   ├── 📂 Intro/              # Intro Animation
│   │   │   │   └── Intro.jsx
│   │   │   │
│   │   │   ├── 📂 menuPics/            # Menu Image Components
│   │   │   │   └── export.jsx
│   │   │   │
│   │   │   ├── 📂 message/            # Messaging Interface
│   │   │   │   └── message.jsx
│   │   │   │
│   │   │   ├── 📂 Navbar/              # Navigation Bar
│   │   │   │   └── Navbar.jsx
│   │   │   │
│   │   │   ├── 📂 newNav/             # New Navigation
│   │   │   │   └── main.jsx
│   │   │   │
│   │   │   ├── 📂 NotFound/            # 404 Page
│   │   │   │   └── NotFound.jsx
│   │   │   │
│   │   │   ├── 📂 pinterest/          # Pinterest Integration
│   │   │   │   ├── pinterest.jsx
│   │   │   │   └── masonry/
│   │   │   │
│   │   │   ├── 📂 Planner/             # Weekly Outfit Planner
│   │   │   │   └── Planner.jsx
│   │   │   │
│   │   │   ├── 📂 Policies/            # Legal Pages
│   │   │   │   ├── PrivacyPolicy.jsx
│   │   │   │   ├── TermsOfService.jsx
│   │   │   │   ├── DataDeletion.jsx
│   │   │   │   └── PoliciesHub.jsx
│   │   │   │
│   │   │   ├── 📂 Profile/             # User Profile
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── ViewUploads.jsx
│   │   │   │
│   │   │   ├── 📂 Recommendations/    # Outfit Recommendations
│   │   │   │   └── Recommendations.jsx
│   │   │   │
│   │   │   ├── 📂 Sellcloth/          # Marketplace
│   │   │   │   └── Sellcloth.jsx
│   │   │   │
│   │   │   ├── 📂 ShareClothes/        # Outfit Sharing
│   │   │   │   ├── ShareClothes.jsx
│   │   │   │   └── shareimage.jsx
│   │   │   │
│   │   │   ├── 📂 Shop/                # Shopping Interface
│   │   │   │   └── shomain.jsx
│   │   │   │
│   │   │   ├── 📂 social_sharing/      # Social Sharing
│   │   │   │   └── social_collections.jsx
│   │   │   │
│   │   │   ├── 📂 test/                # Test Components
│   │   │   │   └── test.jsx
│   │   │   │
│   │   │   ├── 📂 Toast/               # Toast Notifications
│   │   │   │   └── Toast.jsx
│   │   │   │
│   │   │   ├── 📂 VirtualTryOn/        # Virtual Try-On
│   │   │   │   ├── VirtualTryOnEnhanced.jsx
│   │   │   │   └── ClothingMapper.jsx
│   │   │   │
│   │   │   ├── 📂 Wardrobe/            # Wardrobe Management
│   │   │   │   └── Wardrobe.jsx
│   │   │   │
│   │   │   └── 📂 Wishlist/            # Wishlist
│   │   │       └── Wishlist.jsx
│   │   │
│   │   ├── 📂 utils/
│   │   │   └── auth.js                 # Frontend auth utilities
│   │   │
│   │   ├── 📂 styles/
│   │   │   ├── design-system.css       # Design system
│   │   │   └── DESIGN_SYSTEM.md       # Design documentation
│   │   │
│   │   ├── App.jsx                     # Main App Component
│   │   ├── main.jsx                    # Entry Point
│   │   └── index.css                   # Global Styles
│   │
│   ├── 📂 public/
│   │   ├── 📂 AppImages/               # Application Images
│   │   ├── 📂 models/                  # 3D Models
│   │   │   ├── FinalBaseMesh.obj
│   │   │   └── main_model.glb
│   │   ├── logo_main.png              # Main Logo
│   │   └── sitemap1.xml               # Sitemap
│   │
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── vercel.json                     # Vercel deployment
│   └── sitemap.js                      # Sitemap generator
│
├── 📂 ML/                              # Machine Learning Scripts
│   ├── amazon_test.py                 # Amazon scraping test
│   ├── myntra.py                      # Myntra scraping
│   ├── test.py                        # ML testing
│   ├── requirements.txt               # Python dependencies
│   └── 📂 cache/                      # Scraping cache
│       ├── amazon_shop_*.json
│       └── myntra_shop_*.json
│
├── README.md                           # Main documentation
├── FEATURES.md                        # Features overview
├── COMPLETE_FEATURES_LIST.md         # Detailed features (this doc)
└── CODEBASE_STRUCTURE.md              # This file

```

## 🔌 API Endpoints Overview

### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Google OAuth (`/google`)
- `GET /google` - Google OAuth login
- `GET /google/callback` - OAuth callback

### Facebook OAuth (`/facebook`)
- `GET /facebook` - Facebook OAuth login
- `GET /facebook/callback` - OAuth callback

### Password Reset (`/password`)
- `POST /password/reset` - Request password reset
- `POST /password/reset/:token` - Reset password

### User Routes (`/user`)
- `GET /user/profile` - Get user profile
- `POST /user/updateinfo` - Update user info
- `POST /user/updatepassword` - Update password
- `GET /user/images` - Get wardrobe images
- `POST /user/upload-image` - Upload wardrobe images
- `POST /user/clothesUpload` - Upload clothing data
- `POST /user/sellcloth` - List item for sale
- `GET /user/allClothesSell` - Get marketplace items
- `GET /user/getuserdetails` - Get user details
- `GET /user/getwishlist` - Get wishlist
- `GET /user/clothsforweek` - Get weekly clothes
- `POST /user/copytoprofileweekcloths` - Save weekly clothes
- `POST /user/message` - Send message
- `GET /user/message/:username` - Get messages
- `POST /user/save-virtual-try-on` - Save try-on image

### Chat Routes (`/chat`)
- `POST /chat/suggestion` - Get outfit suggestion
- `POST /chat/suggestionforweek` - Weekly suggestions
- `GET /chat/chathistory` - Get chat history
- `POST /chat/getshoppingsuggestions` - Shopping suggestions

### Shop Routes (`/shop`)
- `GET /shop/proxy/amazon` - Amazon product search
- `GET /shop/proxy/myntra` - Myntra product search
- `POST /shop/addtowishlist` - Add to wishlist
- `POST /shop/removefromwishlist` - Remove from wishlist

### Avatar Routes (`/ar`)
- `GET /ar/avatar` - Get user avatar
- `POST /ar/save-avatar` - Save 3D avatar

### Wardrobe Routes
- `POST /uploadselfimages` - Upload self images
- `GET /getselfimages` - Get self images
- `POST /defaultimage` - Set default image
- `GET /menuimages` - Get menu images
- `GET /clothid/getitems` - Get categorized items

### Pinterest Routes (`/pinterestgenerate`)
- `POST /pinterestgenerate/identify` - Identify clothing from image
- `POST /pinterestgenerate/apply` - Apply clothing to user

### Sharing Routes
- `POST /share` - Create shareable outfit
- `GET /share/:id` - Get shared outfit
- `POST /sharetosocial/sharecollection` - Share to social
- `GET /sharetosocial/social` - Get social collections
- `POST /sharetosocial/likecollection` - Like collection

### Image Routes
- `POST /watermark` - Add watermark to image
- `POST /generate-image` - Generate AI image
- `POST /imagegenerate` - Image generation

### Amazon/Myntra Routes
- `GET /amazon` - Amazon search
- `GET /myntra` - Myntra search

## 🗄️ Database Schema Overview

### User Model
```javascript
{
  username: String,
  email: String (unique),
  password: String,
  profileImageURL: String,
  avatarUrl: String,
  avatarCloudinaryUrl: String,
  wardrobe: [String],
  clothes: [String],
  clothessuggestionforweek: String,
  favourites: [String],
  age: Number,
  gender: String,
  preferences: String,
  skinColor: String,
  upperwear: [String],
  lowerwear: [String],
  footwear: [String],
  accessories: [String],
  virtualTryOn: [{imageUrl, createdAt}],
  selfimages: [String],
  selfimagedefault: String
}
```

### Cloth Model (Marketplace)
```javascript
{
  userid: String,
  username: String,
  clothImage: String,
  description: String,
  price: Number,
  image: String
}
```

### ChatMessage Model
```javascript
{
  message: String,
  response: String,
  userId: String,
  timestamps: true
}
```

### ShareCollection Model
```javascript
{
  username: String,
  shareid: String (unique),
  sharecloths: String,
  image: String,
  like: Number,
  likedBy: [String]
}
```

### Avatar Model
```javascript
{
  userId: String,
  username: String,
  originalUrl: String,
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  metadata: Object,
  tryOnHistory: Array
}
```

### Wishlist Model
```javascript
{
  userid: String,
  wishlistitem: Object
}
```

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Image Processing**: Sharp, Cloudinary
- **Email**: Nodemailer
- **AI**: Google Gemini, OpenAI GPT-4, OpenRouter

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: CSS Modules, Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **HTTP Client**: Axios
- **Icons**: React Icons

### ML/AI
- **Language**: Python
- **Libraries**: Cheerio (web scraping)
- **APIs**: Google Vision, Gemini, OpenAI

### Deployment
- **Platform**: Vercel
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary
- **Version Control**: Git

## 📊 Code Statistics

- **Backend Routes**: 23 route files
- **Frontend Components**: 40+ components
- **Database Models**: 8 models
- **API Endpoints**: 50+ endpoints
- **Third-party Integrations**: 15+ services

## 🔐 Security Features

- JWT token authentication
- Secure cookie management
- CORS configuration
- Password encryption
- Session management
- Token expiration
- Input validation
- File upload restrictions
- Rate limiting (where applicable)

## 🚀 Deployment Architecture

```
Frontend (Vercel)
    ↓
Backend API (Vercel Serverless)
    ↓
MongoDB Atlas (Database)
    ↓
Cloudinary (Image CDN)
    ↓
External APIs (OpenWeather, OAuth, AI Services)
```

---

*This structure represents the complete OUTFIT_AI codebase as of the latest analysis.*

