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

### For Admins
- City-based administration (each admin manages their city)
- Dashboard with analytics and metrics
- Issue management (approve, reject, resolve)
- Priority-based issue sorting
- Heatmap visualization of problem zones
- Fake report detection and user banning
- Weekly trend analysis

### Technical Features
- AI image analysis using Groq Vision API
- Spam and relevance detection
- Google Maps integration with city centering
- HttpOnly cookie authentication
- Automatic token refresh
- City-based access control
- Real-time issue density visualization

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

## 🎨 UI Components

### Shared Components
- `Navbar` - Navigation bar
- `Sidebar` - Admin/user sidebar
- `Footer` - Footer component
- `GoogleMapsWrapper` - Google Maps loader
- `CitySelector` - City dropdown

### Pages
- Home, About, Login, Register
- User: Dashboard, Report Issue, My Issues, Verify Issues, Profile
- Admin: Dashboard, Manage Issues, Analytics, Issue Intelligence, Feedback Metrics
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

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Any Node.js host)
```bash
cd server
npm start
```

Update environment variables:
- Set `NODE_ENV=production`
- Update `VITE_API_URL` to production URL
- Configure CORS for production domain

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

## 📄 License

MIT License

## 👨‍💻 Support

For issues or questions, check the troubleshooting section or review the code comments in key files.

---

**Built with ❤️ for smarter cities**
