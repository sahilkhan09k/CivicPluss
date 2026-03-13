# 🏆 CivicPulse - Hackathon Setup Guide

**Complete step-by-step instructions to set up the CivicPulse project in any GitHub repository**

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js v18+ and npm installed
- MongoDB database (MongoDB Atlas recommended)
- Google Maps API key
- Cloudinary account
- Groq API key
- Gmail account with App Password

## 🚀 Step-by-Step Setup Instructions

### Step 1: Initial Repository Setup

```bash
# Clone the hackathon repository (replace with actual repo URL)
git clone <hackathon-repo-url>
cd <hackathon-repo-name>

# Create the main project structure
mkdir civic-pulse
cd civic-pulse
```

### Step 2: Create Server Directory Structure

```bash
# Create server directory and subdirectories
mkdir server
cd server

# Create all necessary subdirectories
mkdir controllers models routes middlewares utils db public public/temp

# Initialize package.json
npm init -y
```

### Step 3: Install Server Dependencies

```bash
# Install all server dependencies (exact versions from your project)
npm install @google/generative-ai@^0.24.1 bcrypt@^5.1.1 cloudinary@^1.41.0 cookie-parser@^1.4.6 cors@^2.8.5 dotenv@^16.3.1 exifreader@^4.36.1 express@^4.18.2 groq-sdk@^0.7.0 jsonwebtoken@^9.0.2 mongoose@^8.0.0 multer@^1.4.5-lts.1 nodemailer@^8.0.1 openai@^6.18.0 resend@^6.9.2 sharp@^0.34.5 socket.io@^4.8.3

# Install dev dependencies
npm install -D nodemon@^3.0.1

# Or install without version constraints (latest compatible versions)
npm install @google/generative-ai bcrypt cloudinary cookie-parser cors dotenv exifreader express groq-sdk jsonwebtoken mongoose multer nodemailer openai resend sharp socket.io
npm install -D nodemon
```

### Step 4: Create Server Package.json Scripts

Edit `server/package.json` and add these scripts:
```json
{
  "name": "civicplus-server",
  "version": "1.0.0",
  "description": "CivicPulse Backend API",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required for Node.js backend'",
    "create-admin": "node createAdmin.js",
    "add-admin": "node addCustomAdmin.js",
    "create-city-admin": "node createCityAdmin.js",
    "create-all-city-admins": "node createAllCityAdmins.js",
    "check-user-city": "node checkUserCity.js",
    "list-users": "node listAllUsers.js",
    "update-admin-verification": "node updateAdminVerification.js"
  },
  "keywords": [
    "civic",
    "smart-city",
    "api"
  ],
  "author": "",
  "license": "ISC"
}
```

### Step 5: Copy Environment Files

**IMPORTANT**: Copy your existing environment files first before proceeding:

```bash
# Copy server environment file
cp /path/to/your/existing/project/server/.env ./server/.env

# Copy client environment file  
cp /path/to/your/existing/project/client/.env ./client/.env
```

## 🌐 Client Setup Phase

### Step 6: Create Client Directory Structure

```bash
# Go back to root and create client
cd ..
mkdir client
cd client

# Initialize Vite React project
npm create vite@latest . -- --template react

# Install exact dependencies from your project
npm install @googlemaps/markerclusterer@^2.6.2 @react-google-maps/api@^2.20.8 lucide-react@^0.563.0 react@^19.2.0 react-dom@^19.2.0 react-router-dom@^7.13.0 recharts@^3.7.0 socket.io-client@^4.8.3

# Install exact dev dependencies
npm install -D @eslint/js@^9.39.1 @tailwindcss/postcss@^4.1.18 @types/react@^19.2.5 @types/react-dom@^19.2.3 @vitejs/plugin-react@^5.1.1 autoprefixer@^10.4.24 eslint@^9.39.1 eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.4.24 globals@^16.5.0 postcss@^8.5.6 tailwindcss@^4.1.18 vite@^7.2.4

# Or install without version constraints (latest compatible versions)
npm install @googlemaps/markerclusterer @react-google-maps/api lucide-react react react-dom react-router-dom recharts socket.io-client
npm install -D @eslint/js @tailwindcss/postcss @types/react @types/react-dom @vitejs/plugin-react autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals postcss tailwindcss vite
```

### Step 7: Configure Tailwind CSS

Initialize and configure Tailwind CSS:

```bash
# Initialize Tailwind (if not already done by Vite)
# Option 1: Try this first
npx tailwindcss init -p

# Option 2: If above fails on Windows, try:
npm exec tailwindcss init -p

# Option 3: If still failing, create files manually (see below)
```

**If Tailwind init fails, create these files manually:**

Create `client/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `client/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Edit `client/tailwind.config.js` (or create if manually created above):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
```

### Step 8: Update Client CSS

Replace `client/src/index.css` content:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200;
  }
  
  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200;
  }
  
  .card-gradient {
    @apply bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50;
  }
  
  .input-field {
    @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200;
  }
}
```

### Step 9: Create Client Directory Structure

```bash
# Create client subdirectories
cd src
mkdir components pages context services constants assets
mkdir pages/admin pages/user
cd ../public
# public directory already exists from Vite setup
cd ..
```

## 📁 File Copying Phase

### Step 10: Copy Server Files - Phase 1 (Core Files)

Copy the main server files first:

```bash
# Copy main server files
cp /path/to/your/existing/project/server/server.js ./server/     # Main entry point
cp /path/to/your/existing/project/server/app.js ./server/       # Express app configuration
cp /path/to/your/existing/project/server/constants.js ./server/ # Application constants
```

### Step 11: Copy Server Files - Phase 2 (Database & Models)

```bash
# Copy database connection
cp /path/to/your/existing/project/server/db/index.js ./server/db/

# Copy all models
cp /path/to/your/existing/project/server/models/user.model.js ./server/models/
cp /path/to/your/existing/project/server/models/issue.model.js ./server/models/
cp /path/to/your/existing/project/server/models/challenge.model.js ./server/models/
cp /path/to/your/existing/project/server/models/notification.model.js ./server/models/
cp /path/to/your/existing/project/server/models/otp.model.js ./server/models/
cp /path/to/your/existing/project/server/models/bannedEmail.model.js ./server/models/
```

### Step 12: Copy Server Files - Phase 3 (Controllers)

```bash
# Copy all controllers
cp /path/to/your/existing/project/server/controllers/auth.controller.js ./server/controllers/
cp /path/to/your/existing/project/server/controllers/user.controller.js ./server/controllers/
cp /path/to/your/existing/project/server/controllers/issue.controller.js ./server/controllers/
cp /path/to/your/existing/project/server/controllers/challenge.controller.js ./server/controllers/
cp /path/to/your/existing/project/server/controllers/notification.controller.js ./server/controllers/
```

### Step 13: Copy Server Files - Phase 4 (Routes)

```bash
# Copy all routes
cp /path/to/your/existing/project/server/routes/auth.routes.js ./server/routes/
cp /path/to/your/existing/project/server/routes/user.routes.js ./server/routes/
cp /path/to/your/existing/project/server/routes/issue.routes.js ./server/routes/
cp /path/to/your/existing/project/server/routes/challenge.routes.js ./server/routes/
cp /path/to/your/existing/project/server/routes/notification.routes.js ./server/routes/
```

### Step 14: Copy Server Files - Phase 5 (Middlewares & Utils)

```bash
# Copy middlewares
cp /path/to/your/existing/project/server/middlewares/auth.middleware.js ./server/middlewares/
cp /path/to/your/existing/project/server/middlewares/multer.middleware.js ./server/middlewares/

# Copy all utility files
cp /path/to/your/existing/project/server/utils/apiError.js ./server/utils/
cp /path/to/your/existing/project/server/utils/apiResponse.js ./server/utils/
cp /path/to/your/existing/project/server/utils/asyncHandler.js ./server/utils/
cp /path/to/your/existing/project/server/utils/cloudinary.js ./server/utils/
cp /path/to/your/existing/project/server/utils/sendEmail.js ./server/utils/
cp /path/to/your/existing/project/server/utils/sendEmailResend.js ./server/utils/
cp /path/to/your/existing/project/server/utils/aiAnalyzeImage.js ./server/utils/
cp /path/to/your/existing/project/server/utils/aiAnalyzeImageGroq.js ./server/utils/
cp /path/to/your/existing/project/server/utils/aiAnalyzeIssue.js ./server/utils/
cp /path/to/your/existing/project/server/utils/locationValidator.js ./server/utils/
cp /path/to/your/existing/project/server/utils/photoComparator.js ./server/utils/
cp /path/to/your/existing/project/server/utils/requireAdmin.js ./server/utils/
cp /path/to/your/existing/project/server/utils/spamDetection.js ./server/utils/
cp /path/to/your/existing/project/server/utils/trustScoreScheduler.js ./server/utils/
```

### Step 15: Copy Server Files - Phase 6 (Admin Scripts)

```bash
# Copy admin utility scripts
cp /path/to/your/existing/project/server/createAdmin.js ./server/
cp /path/to/your/existing/project/server/addCustomAdmin.js ./server/
cp /path/to/your/existing/project/server/createCityAdmin.js ./server/
cp /path/to/your/existing/project/server/createAllCityAdmins.js ./server/
cp /path/to/your/existing/project/server/listAllUsers.js ./server/
cp /path/to/your/existing/project/server/checkUserCity.js ./server/
cp /path/to/your/existing/project/server/updateAdminVerification.js ./server/

# Copy test scripts (optional)
cp /path/to/your/existing/project/server/testAdminLogin.js ./server/
cp /path/to/your/existing/project/server/testEmail.js ./server/
cp /path/to/your/existing/project/server/testNotifications.js ./server/
cp /path/to/your/existing/project/server/testChallengeNotifications.js ./server/
cp /path/to/your/existing/project/server/testTrustScoreScheduler.js ./server/
```

### Step 16: Copy Server Files - Phase 7 (Services & Socket)

```bash
# Create services and socket directories
mkdir ./server/services
mkdir ./server/socket

# Copy services
cp /path/to/your/existing/project/server/services/notification.service.js ./server/services/
cp /path/to/your/existing/project/server/services/notificationService.js ./server/services/
cp /path/to/your/existing/project/server/services/README.md ./server/services/
cp /path/to/your/existing/project/server/services/IMPLEMENTATION_SUMMARY.md ./server/services/

# Copy socket files
cp /path/to/your/existing/project/server/socket/socketServer.js ./server/socket/
```

### Step 17: Copy Client Files - Phase 1 (Main Files)

```bash
# Copy main client files
cp /path/to/your/existing/project/client/index.html ./client/
cp /path/to/your/existing/project/client/vite.config.js ./client/
cp /path/to/your/existing/project/client/postcss.config.js ./client/
cp /path/to/your/existing/project/client/vercel.json ./client/

# Copy src main files
cp /path/to/your/existing/project/client/src/main.jsx ./client/src/
cp /path/to/your/existing/project/client/src/App.jsx ./client/src/
cp /path/to/your/existing/project/client/src/App.css ./client/src/
```

### Step 18: Copy Client Files - Phase 2 (Constants & Services)

```bash
# Copy constants
cp /path/to/your/existing/project/client/src/constants/cities.js ./client/src/constants/

# Copy services
cp /path/to/your/existing/project/client/src/services/api.js ./client/src/services/
```

### Step 19: Copy Client Files - Phase 3 (Context)

```bash
# Copy context files
cp /path/to/your/existing/project/client/src/context/AuthContext.jsx ./client/src/context/
cp /path/to/your/existing/project/client/src/context/SocketContext.jsx ./client/src/context/
```

### Step 20: Copy Client Files - Phase 4 (Components)

```bash
# Copy all components
cp /path/to/your/existing/project/client/src/components/Navbar.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/Sidebar.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/Footer.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/GoogleMapsWrapper.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/CitySelector.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/ChallengeButton.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/ChallengeModal.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/ChallengeHistory.jsx ./client/src/components/
cp /path/to/your/existing/project/client/src/components/NotificationBell.jsx ./client/src/components/
```

### Step 21: Copy Client Files - Phase 5 (User Pages)

```bash
# Copy user pages
cp /path/to/your/existing/project/client/src/pages/Home.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/About.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/Login.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/Register.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/VerifyEmail.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/CityMap.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/TestMap.jsx ./client/src/pages/

# Copy user dashboard pages
cp /path/to/your/existing/project/client/src/pages/user/Dashboard.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/user/Profile.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/user/ReportIssue.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/user/MyIssues.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/user/IssueDetail.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/user/VerifyIssues.jsx ./client/src/pages/user/
```

### Step 22: Copy Client Files - Phase 6 (Admin Pages)

```bash
# Copy admin pages
cp /path/to/your/existing/project/client/src/pages/admin/AdminDashboard.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/ManageIssues.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/AdminIssueDetail.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/Analytics.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/FeedbackMetrics.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/IssueIntelligence.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/InProgressIssues.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/ResolvedIssues.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/ChallengeQueue.jsx ./client/src/pages/admin/
cp /path/to/your/existing/project/client/src/pages/admin/ChallengeHistory.jsx ./client/src/pages/admin/
```

### Step 23: Copy Client Files - Phase 7 (Assets)

```bash
# Create assets directory and copy assets
mkdir ./client/src/assets
cp /path/to/your/existing/project/client/src/assets/react.svg ./client/src/assets/

# Copy public assets
mkdir ./client/public
cp /path/to/your/existing/project/client/public/vite.svg ./client/public/
```

### Step 24: Create Root Package.json (Optional)

Create `package.json` in the root directory for easier development:
```json
{
  "name": "civic-pulse",
  "version": "1.0.0",
  "description": "Smart City Issue Reporting Platform",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "install-all": "cd server && npm install && cd ../client && npm install",
    "build": "cd client && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### Step 25: Install All Dependencies

```bash
# From root directory
npm install
npm run install-all
```

### Step 26: Set Up Environment Variables

1. **MongoDB Atlas Setup**:
   - Go to https://cloud.mongodb.com
   - Create a new cluster
   - Get connection string
   - Update `MONGODB_URI` in `server/.env`

2. **Google Maps API**:
   - Go to Google Cloud Console
   - Enable Maps JavaScript API
   - Create API key
   - Update `VITE_GOOGLE_MAPS_API_KEY` in `client/.env`

3. **Cloudinary Setup**:
   - Go to https://cloudinary.com
   - Get cloud name, API key, and secret
   - Update Cloudinary variables in `server/.env`

4. **Groq API**:
   - Go to https://console.groq.com
   - Get API key
   - Update `GROQ_API_KEY` in `server/.env`

5. **Gmail App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
   - Update `EMAIL_PASSWORD` in `server/.env`

### Step 27: Install All Dependencies

```bash
# From root directory
npm install
npm run install-all
```

### Step 21: Start Development Servers

```bash
# Option 1: Start both servers together
npm run dev

# Option 2: Start separately
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Step 22: Create Admin Accounts

```bash
# Create default admin accounts
cd server
npm run create-admin

# Create city-specific admin
npm run create-city-admin Mumbai
npm run create-city-admin Pune

# Create custom admin (interactive)
npm run add-admin
```

### Step 23: Test the Application

1. **Frontend**: Open http://localhost:5173
2. **Backend**: API available at http://localhost:5000
3. **Test Registration**: Register a new user
4. **Test Login**: Login with created admin accounts
5. **Test Maps**: Verify Google Maps loads correctly
6. **Test Image Upload**: Try reporting an issue with photo

### Step 24: Verify All Features

**Test Checklist**:
- [ ] User registration with email OTP
- [ ] User login/logout
- [ ] Issue reporting with photo upload
- [ ] Google Maps integration
- [ ] Admin dashboard
- [ ] Issue management (admin)
- [ ] Challenge system (24-hour window)
- [ ] AI image analysis
- [ ] Email notifications
- [ ] City-based filtering

### Step 25: Production Deployment (Optional)

If you need to deploy during hackathon:

1. **Backend (Render)**:
   - Connect GitHub repo
   - Set root directory to `server`
   - Add all environment variables
   - Deploy

2. **Frontend (Vercel)**:
   - Connect GitHub repo
   - Set root directory to `client`
   - Add environment variables
   - Deploy

## 🔧 Quick Commands Reference

```bash
# Install everything
npm run install-all

# Start development
npm run dev

# Create admin
cd server && npm run create-city-admin <CityName>

# List users
cd server && npm run list-users

# Build for production
npm run build
```

## 📝 Quick File Copy Reference

**Replace `/path/to/your/existing/project/` with your actual project path**

### Environment Files (Step 5)
```bash
cp /path/to/your/existing/project/server/.env ./server/.env
cp /path/to/your/existing/project/client/.env ./client/.env
```

### Server Files (Steps 6-12)
```bash
# Core files
cp /path/to/your/existing/project/server/{server.js,app.js,constants.js} ./server/

# Database & Models
cp /path/to/your/existing/project/server/db/index.js ./server/db/
cp /path/to/your/existing/project/server/models/*.js ./server/models/

# Controllers, Routes, Middlewares, Utils
cp /path/to/your/existing/project/server/controllers/*.js ./server/controllers/
cp /path/to/your/existing/project/server/routes/*.js ./server/routes/
cp /path/to/your/existing/project/server/middlewares/*.js ./server/middlewares/
cp /path/to/your/existing/project/server/utils/*.js ./server/utils/

# Admin scripts
cp /path/to/your/existing/project/server/*.js ./server/

# Services & Socket
cp /path/to/your/existing/project/server/services/* ./server/services/
cp /path/to/your/existing/project/server/socket/* ./server/socket/
```

### Client Files (Steps 13-19)
```bash
# Main files
cp /path/to/your/existing/project/client/{index.html,vite.config.js,postcss.config.js,vercel.json} ./client/
cp /path/to/your/existing/project/client/src/{main.jsx,App.jsx,App.css} ./client/src/

# Constants, Services, Context
cp /path/to/your/existing/project/client/src/constants/*.js ./client/src/constants/
cp /path/to/your/existing/project/client/src/services/*.js ./client/src/services/
cp /path/to/your/existing/project/client/src/context/*.jsx ./client/src/context/

# Components
cp /path/to/your/existing/project/client/src/components/*.jsx ./client/src/components/

# Pages
cp /path/to/your/existing/project/client/src/pages/*.jsx ./client/src/pages/
cp /path/to/your/existing/project/client/src/pages/user/*.jsx ./client/src/pages/user/
cp /path/to/your/existing/project/client/src/pages/admin/*.jsx ./client/src/pages/admin/

# Assets
cp /path/to/your/existing/project/client/src/assets/* ./client/src/assets/
cp /path/to/your/existing/project/client/public/* ./client/public/
```

## 🚨 Common Issues & Solutions

### 1. MongoDB Connection Error
- Check MongoDB URI format
- Ensure IP whitelist includes your IP
- Verify database user permissions

### 2. Google Maps Not Loading
- Check API key is valid
- Enable Maps JavaScript API
- Verify domain restrictions

### 3. Image Upload Failing
- Check Cloudinary credentials
- Verify file size limits
- Check network connectivity

### 4. Email OTP Not Sending
- Verify Gmail App Password
- Check email user format
- Ensure 2FA is enabled on Gmail

### 5. Challenge System Issues
- Enable location services in browser
- Check Groq API key and limits
- Verify admin decision timestamp exists

### 6. Tailwind CSS Init Failing (Windows)
```bash
# Try these alternatives in order:
npm exec tailwindcss init -p
# OR
npx --yes tailwindcss init -p
# OR create files manually (see Step 7)
```

### 7. Node Modules Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 8. Port Already in Use
```bash
# Kill processes on ports 5000 and 5173
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different ports in package.json scripts
```

## 📁 Final Project Structure

```
civic-pulse/
├── package.json                 # Root package.json (optional)
├── server/                      # Backend
│   ├── package.json
│   ├── .env
│   ├── server.js               # Main server file
│   ├── app.js                  # Express app
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── middlewares/            # Auth & upload middleware
│   ├── utils/                  # Helper functions
│   ├── db/                     # Database connection
│   ├── public/temp/            # Temporary uploads
│   └── *.js                    # Admin utility scripts
├── client/                     # Frontend
│   ├── package.json
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/         # Reusable components
│       ├── pages/              # Page components
│       │   ├── admin/         # Admin pages
│       │   └── user/          # User pages
│       ├── context/           # React context
│       ├── services/          # API services
│       └── constants/         # Constants & data
└── HACKATHON_SETUP_GUIDE.md   # This file
```

## 🎯 Hackathon Tips

1. **Time Management**: Follow this guide step-by-step, don't skip steps
2. **Environment Variables**: Double-check all API keys and secrets
3. **Testing**: Test each feature as you set it up
4. **Backup**: Keep your original project as backup
5. **Documentation**: This guide serves as your documentation
6. **Team Coordination**: Share this guide with your team members

## 🏆 Success Checklist

- [ ] Repository cloned and structured
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Both servers running
- [ ] Admin accounts created
- [ ] All features tested
- [ ] Ready for hackathon presentation!

---

**Good luck with your hackathon! 🚀**

*Built with ❤️ for smarter cities*