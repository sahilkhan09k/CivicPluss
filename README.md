# CivicPulse - Smart City Issue Reporting Platform

A full-stack web application for reporting and managing civic infrastructure issues across Maharashtra cities with AI-powered analysis, real-time maps, and city-based administration.

## 🚀 Features

### For Citizens
- Report civic issues with photos and location
- **Email verification with OTP**
- AI-powered image analysis and priority detection
- View issues on interactive maps with heatmaps
- Track issue status and resolution
- Verify other users' reports
- Trust score system for credibility
- City-specific issue filtering
- **Challenge admin decisions within 24 hours**
- **Location-verified photo evidence for appeals**
- **AI-powered photo comparison for challenges**

### For Admins
- City-based administration (each admin manages their city)
- Dashboard with analytics and metrics
- Issue management (approve, reject, resolve)
- Priority-based issue sorting
- Heatmap visualization of problem zones
- Fake report detection and user banning
- Weekly trend analysis

### For Super Admins
- **Review user challenges to admin decisions**
- **Side-by-side photo comparison interface**
- **Overturn incorrect admin decisions**
- **Challenge history and admin performance metrics**
- **Accountability tracking for admin actions**

### Technical Features
- AI image analysis using Groq Vision API
- Spam and relevance detection
- Google Maps integration with city centering
- HttpOnly cookie authentication
- Automatic token refresh
- City-based access control
- Real-time issue density visualization
- **Challenge and appeal system with 24-hour window**
- **Geolocation validation (50-meter radius)**
- **AI photo similarity comparison (Groq Vision)**
- **Database transactions for atomic operations**
- **Email notifications for challenge lifecycle**

## 📋 Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Google Maps API (@react-google-maps/api)
- Recharts for analytics
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image storage
- Groq SDK for AI analysis
- bcrypt for password hashing

## 🛠️ Installation

### Prerequisites
- Node.js v18+ and npm
- MongoDB database
- Google Maps API key
- Cloudinary account
- Groq API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd civic-pulse
```

### 2. Server Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=civicpulse

JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GROQ_API_KEY=your_groq_api_key

EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password

NODE_ENV=development
```

**Note**: For Gmail, you need to generate an App Password:
1. Go to Google Account Settings
2. Security → 2-Step Verification → App Passwords
3. Generate password for "Mail"
4. Use that password in `EMAIL_PASSWORD`

### 3. Client Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Start Development Servers

**Option A: Using Scripts (Windows)**
```bash
# From root directory
start-dev.bat
```

**Option B: Manual Start**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Access the app at `http://localhost:5173`

## 👥 User Management

### Create Admin Accounts

**Create admin for any city:**
```bash
cd server
npm run create-city-admin <CityName>
```

Examples:
```bash
npm run create-city-admin Mumbai
npm run create-city-admin Pune
npm run create-city-admin Ratnagiri
```

This creates: `{cityname}@civic.com` / `admin123`

**Create custom admin (interactive):**
```bash
npm run add-admin
```

**List all users:**
```bash
npm run list-users
```

**Check/update user's city:**
```bash
npm run check-user-city
```

### Default Accounts

After running `npm run create-admin`:
- **Mumbai Admin**: `admin@civic.com` / `admin123`
- **Super Admin**: `superadmin@civic.com` / `super123` (access to all cities)

## 🗺️ Available Cities

35 Maharashtra cities supported:
Ahmednagar, Akola, Amravati, Aurangabad, Beed, Bhandara, Buldhana, Chandrapur, Dhule, Gadchiroli, Gondia, Hingoli, Jalgaon, Jalna, Kolhapur, Latur, Mumbai, Nagpur, Nanded, Nandurbar, Nashik, Osmanabad, Palghar, Parbhani, Pune, Raigad, Ratnagiri, Sangli, Satara, Sindhudurg, Solapur, Thane, Wardha, Washim, Yavatmal

## 📁 Project Structure

```
civic-pulse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── admin/    # Admin pages
│   │   │   └── user/     # User pages
│   │   ├── context/      # React context (Auth)
│   │   ├── services/     # API services
│   │   └── constants/    # City data
│   └── public/
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth & upload middleware
│   ├── utils/           # Helper functions
│   └── db/              # Database connection
└── README.md
```

## 🔐 Authentication Flow

1. User registers with email, password, and city
2. Server creates user with hashed password
3. Login returns httpOnly cookies (accessToken, refreshToken)
4. Frontend stores only user profile in localStorage
5. Tokens automatically refresh on expiry
6. City-based access control on all routes

## 🗺️ Map Features

### City Centering
- Admin maps center on their assigned city
- Zoom level 13 for city view
- Soft boundaries (~50km radius)
- Public map shows entire Maharashtra

### Heatmap Visualization
- Red zones: High priority issues
- Yellow zones: Medium priority issues
- Green zones: Low priority issues
- Density-based opacity
- Toggle on/off

### Interactive Features
- Click markers for issue details
- Filter by priority
- View issue images
- Real-time issue count

## 🤖 AI Features

### Image Analysis
- Automatic issue type detection
- Priority calculation
- Severity assessment
- Relevance checking

### Spam Detection
- Pattern matching for spam text
- AI-powered relevance validation
- Fake report detection
- Automatic user banning after 3 fake reports

### Photo Comparison (Challenge System)
- AI-powered similarity scoring using Groq Vision API
- Compares original issue photo with challenge photo
- Similarity threshold: >50% for acceptance
- Automatic challenge status determination
- Confidence scoring and detailed analysis

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Issues
- `GET /api/v1/issues` - Get all issues (city-filtered)
- `POST /api/v1/issues` - Create issue
- `GET /api/v1/issues/:id` - Get issue details
- `PATCH /api/v1/issues/:id/status` - Update status (admin)
- `POST /api/v1/issues/:id/verify` - Verify issue
- `POST /api/v1/issues/:id/fake` - Report as fake (admin)

### Users
- `GET /api/v1/users/current` - Get current user
- `PATCH /api/v1/users/profile` - Update profile
- `GET /api/v1/users/stats` - Get user stats

### Admin
- `GET /api/v1/issues/admin/stats` - Get admin statistics
- `GET /api/v1/issues/priority/:priority` - Get issues by priority

### Challenges (New)
- `POST /api/v1/challenge/submit` - Submit challenge with photo and location
- `GET /api/v1/challenge/queue` - Get challenge queue (super admin only)
- `PUT /api/v1/challenge/review/:id` - Review challenge (super admin only)
- `GET /api/v1/challenge/history` - Get challenge history with stats (super admin only)
- `GET /api/v1/challenge/user` - Get user's challenges

## 🎨 UI Components

### Shared Components
- `Navbar` - Navigation bar
- `Sidebar` - Admin/user sidebar
- `Footer` - Footer component
- `GoogleMapsWrapper` - Google Maps loader
- `CitySelector` - City dropdown
- `ChallengeButton` - 24-hour countdown timer for challenges
- `ChallengeModal` - Location verification and photo capture interface
- `ChallengeHistory` - Challenge history with admin metrics

### Pages
- Home, About, Login, Register
- User: Dashboard, Report Issue, My Issues, Verify Issues, Profile
- Admin: Dashboard, Manage Issues, Analytics, Issue Intelligence, Feedback Metrics, **Challenge Queue**, **Challenge History**
- Public: City Map with heatmap

## 🚦 Issue Priority System

Priority calculated based on:
- Issue type (pothole, water leak, etc.)
- Severity level
- Location density
- Verification count
- AI analysis

Levels: High, Medium, Low

## 👤 Trust Score System

- Starts at 100
- +5 for verified reports
- -10 for fake reports
- -20 for spam
- Users banned after 3 fake reports
- **No penalty for failed challenges** (encourages accountability)

## ⚖️ Challenge and Appeal System

### How It Works

1. **Admin Decision**: Admin marks issue as spam or resolved
2. **24-Hour Window**: User has 24 hours to challenge the decision
3. **Location Verification**: User must be within 50 meters of original issue location
4. **Photo Evidence**: User captures live photo (camera only, no gallery)
5. **AI Comparison**: Groq Vision API compares photos and calculates similarity score
6. **Automatic Decision**: 
   - Similarity >50% → Challenge accepted, sent to super admin review
   - Similarity ≤50% → Challenge rejected, admin decision stands
7. **Super Admin Review**: Reviews accepted challenges with side-by-side photos
8. **Final Decision**: 
   - Admin Wrong → Issue restored to original state
   - Admin Correct → Issue state maintained

### Challenge Features

- **Real-time countdown timer** showing time remaining in 24-hour window
- **Geolocation validation** using haversine distance calculation
- **Live camera capture** with HTML5 `capture="environment"` attribute
- **AI similarity scoring** with confidence levels
- **Email notifications** at each stage (submission, acceptance, rejection, review)
- **Database transactions** ensuring atomic operations during review
- **Admin accountability tracking** with overturn rates and performance metrics

### Challenge Rejection Scenarios

- Location >50 meters from original issue
- Photo similarity ≤50%
- Challenge window expired (>24 hours)
- Duplicate challenge attempt
- Invalid photo format or size

### Super Admin Tools

- **Challenge Queue**: View all accepted challenges sorted by oldest first
- **Photo Comparison**: Side-by-side view of original and challenge photos
- **Review Interface**: Make decisions with optional notes
- **Challenge History**: Complete audit trail with filtering
- **Admin Metrics**: Track overturn rates and admin performance

## 🌐 Deployment

### Production URLs
- **Frontend**: https://civic-pluss.vercel.app
- **Backend**: https://civicpluss.onrender.com

### Backend Deployment (Render)

1. **Create New Web Service** on Render
2. **Connect GitHub Repository**: `https://github.com/sahilkhan09k/CivicPluss`
3. **Configure Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. **Add Environment Variables**:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=https://civic-pluss.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=45m
REFRESH_TOKEN_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=production
```

5. **Deploy** - Render will automatically build and deploy

### Frontend Deployment (Vercel)

1. **Import Project** from GitHub on Vercel
2. **Configure Settings**:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**:
```env
VITE_API_URL=https://civicpluss.onrender.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. **Deploy** - Vercel will automatically build and deploy

### Post-Deployment Steps

1. **Update CORS**: Ensure backend `CORS_ORIGIN` includes your Vercel URL
2. **Test Authentication**: Verify cookies work across domains
3. **Create Admin Accounts**: Use the admin creation scripts on your production database
4. **Test Email**: Register a new user to verify OTP emails are sent
5. **Test Maps**: Verify Google Maps loads correctly with your API key

### Important Notes

- **Cookies**: The app uses `sameSite: "none"` and `secure: true` in production for cross-domain cookies
- **CORS**: Backend allows requests from Vercel frontend URL
- **Environment**: `NODE_ENV=production` must be set on Render
- **MongoDB**: Use MongoDB Atlas for production database
- **Email**: Gmail App Password required for OTP emails

## 📝 Environment Variables

### Required Server Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `CLOUDINARY_*` - Cloudinary credentials
- `GROQ_API_KEY` - Groq AI API key

### Required Client Variables
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

## 🐛 Troubleshooting

### Map not centering on city
- Verify admin has city field set in database
- Check Google Maps API key is valid
- Clear browser localStorage and re-login

### AI analysis failing
- Verify Groq API key is valid
- Check image format (JPEG, PNG supported)
- Ensure Cloudinary is configured

### Authentication issues
- Clear browser cookies and localStorage
- Check JWT secrets are set
- Verify MongoDB connection

### Challenge system issues
- **Location permission denied**: Enable location services in browser settings
- **Challenge button not appearing**: Verify issue has `adminDecisionTimestamp` set
- **Photo comparison failing**: Check Groq API key and rate limits
- **Challenge queue empty**: Only shows challenges with status "accepted"
- **Super admin access denied**: Verify user role is `super_admin` in database

## 📄 License

MIT License

## 👨‍💻 Support

For issues or questions, check the troubleshooting section or review the code comments in key files.

---

**Built with ❤️ for smarter cities**
