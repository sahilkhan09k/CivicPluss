# CivicPulse - Smart City Issue Reporting Platform

A comprehensive full-stack web application for reporting and managing civic infrastructure issues across all 125+ Maharashtra cities with AI-powered analysis, real-time maps, trust score system, and advanced challenge/appeal mechanisms.

## 🚀 Key Features Overview

### 🏛️ **Multi-City Administration**
- **125+ Maharashtra Cities**: Complete coverage from Mumbai to smallest towns
- **City-Based Admin System**: Each city has dedicated administrators
- **Super Admin Oversight**: Cross-city management and challenge review system
- **Scalable Architecture**: Easy addition of new cities and admins

### 🤖 **Advanced AI Integration**
- **Groq Vision API**: Intelligent image analysis and issue categorization
- **Physical Dimensions Analysis**: AI calculates pothole depth/width, garbage area coverage
- **Spam Detection**: Automated filtering of irrelevant or fake reports
- **Photo Comparison**: AI-powered similarity scoring for challenge verification
- **Resolution Verification**: AI validates admin resolution photos (60% threshold)

### ⚖️ **Trust & Accountability System**
- **Dynamic Trust Scores**: User credibility tracking (0-100 scale)
- **24-Hour Challenge Window**: Users can appeal admin decisions
- **Geolocation Verification**: 50-meter radius validation for challenges
- **Admin Performance Tracking**: Overturn rates and decision quality metrics
- **Automatic Penalties**: Trust score reduction for spam/fake reports

## 📋 Complete Feature Set

### 👥 **For Citizens**

#### **Issue Reporting**
- 📸 **Photo Upload with AI Analysis**: Automatic categorization and severity assessment
- 📍 **GPS Location Capture**: Precise geolocation with Google Maps integration
- 🏙️ **City-Specific Filtering**: Issues automatically tagged to user's city
- ⏰ **Smart Rate Limiting**: 15-minute cooldown, 20 issues per day limit
- 🎯 **Priority Calculation**: AI-driven priority scoring based on multiple factors
- 📏 **Dimension Analysis**: AI estimates physical measurements (depth, width, area)

#### **Account Management**
- 📧 **Email Verification**: OTP-based registration with Nodemailer
- 🏘️ **City Selection**: Choose from 125+ Maharashtra cities
- 🔐 **Secure Authentication**: JWT tokens with automatic refresh
- 📊 **Trust Score Tracking**: Real-time credibility monitoring
- 🚫 **Automatic Suspension**: Account blocking when trust score reaches zero

#### **Issue Tracking & Interaction**
- 📱 **Personal Dashboard**: View all submitted issues with status tracking
- ✅ **Issue Verification**: Verify other users' reports to earn trust points
- 🗺️ **Interactive Maps**: View issues on Google Maps with heatmap visualization
- 📈 **Status Updates**: Real-time notifications on issue progress
- 📧 **Email Notifications**: Automated updates on resolution and spam marking

#### **Challenge & Appeal System**
- ⚖️ **24-Hour Challenge Window**: Appeal admin decisions within time limit
- 📍 **Location Verification**: Must be within 50 meters of original issue
- 📷 **Live Photo Capture**: Camera-only evidence (no gallery uploads)
- 🤖 **AI Similarity Scoring**: Automated photo comparison with confidence levels
- 📊 **Challenge History**: Track all appeals and their outcomes

### 🛡️ **For City Admins**

#### **Issue Management**
- 🏙️ **City-Specific Dashboard**: Manage only issues within assigned city
- 📊 **Priority-Based Sorting**: Issues ranked by AI-calculated urgency
- 🔄 **Status Management**: Update issues (Pending → In Progress → Resolved)
- 📸 **Resolution Photos**: Upload proof of completion with AI verification
- 🚫 **Spam Reporting**: Mark fake issues with automatic user penalties

#### **Analytics & Insights**
- 📈 **Performance Metrics**: Resolution rates, average response time
- 🗺️ **Heatmap Analysis**: Visual problem zone identification
- 📊 **Weekly Trends**: Issue reporting and resolution patterns
- 🎯 **Category Statistics**: Breakdown by issue type and severity
- 👥 **User Activity**: Monitor reporting patterns and trust scores

#### **Quality Control**
- 🔍 **AI-Assisted Validation**: Automatic relevance and spam detection
- 📏 **Dimension Verification**: Review AI-calculated measurements
- 🤖 **Resolution Scoring**: AI validates completion photos (60% threshold required)
- ⚠️ **Fake Report Detection**: Automated user penalties and banning

### 👑 **For Super Admins**

#### **Challenge Review System**
- ⚖️ **Challenge Queue**: Review all accepted user appeals
- 🖼️ **Side-by-Side Comparison**: Original vs challenge photo analysis
- 📝 **Decision Making**: Overturn or uphold admin decisions with notes
- 📊 **Admin Performance**: Track overturn rates and decision quality
- 📧 **Automated Notifications**: Email updates throughout review process

#### **System-Wide Management**
- 🌐 **Cross-City Access**: Manage issues across all Maharashtra cities
- 👥 **Admin Oversight**: Monitor city admin performance and decisions
- 📊 **Global Analytics**: System-wide statistics and trends
- 🔧 **User Management**: Handle escalated cases and account issues

## 🛠️ Technical Architecture

### **Frontend Stack**
- ⚛️ **React 18** with Vite for fast development
- 🎨 **TailwindCSS** for responsive, modern UI design
- 🗺️ **Google Maps API** with custom heatmap visualization
- 📊 **Recharts** for analytics and data visualization
- 🔗 **React Router** for seamless navigation
- 🎯 **Lucide React** for consistent iconography

### **Backend Stack**
- 🟢 **Node.js** with Express framework
- 🍃 **MongoDB** with Mongoose ODM
- 🔐 **JWT Authentication** with httpOnly cookies
- ☁️ **Cloudinary** for image storage and optimization
- 🤖 **Groq SDK** for AI image analysis
- 📧 **Nodemailer** for email notifications

### **AI & External Services**
- 🧠 **Groq Vision API**: Image analysis and categorization
- 📸 **Photo Comparison**: AI-powered similarity scoring
- 🗺️ **Google Maps**: Location services and visualization
- 📧 **Gmail SMTP**: Reliable email delivery
- ☁️ **Cloudinary**: Image processing and CDN

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js v18+ and npm
- MongoDB database (local or Atlas)
- Google Maps API key with Places and Maps JavaScript API
- Cloudinary account for image storage
- Groq API key for AI analysis
- Gmail account with App Password for emails

### **1. Clone Repository**
```bash
git clone <repository-url>
cd civic-pulse
```

### **2. Server Setup**
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

ACCESS_TOKEN_SECRET=your_access_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRES_IN=45m
REFRESH_TOKEN_EXPIRES_IN=7d

GROQ_API_KEY=your_groq_api_key

EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings → Security → App Passwords
3. Generate password for "Mail"
4. Use the 16-character password in `EMAIL_PASSWORD`

### **3. Client Setup**
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **4. Start Development Servers**

**Option A: Concurrent Start (Recommended)**
```bash
# From root directory
npm run dev
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

Access the application at `http://localhost:5173`

## 👥 User Management & Admin Setup

### **Create City Administrators**

**Create admin for specific city:**
```bash
cd server
npm run create-city-admin
# Follow prompts to enter city name
```

**Create all city admins at once:**
```bash
npm run create-all-city-admins
```
This creates admins for all 125+ Maharashtra cities with pattern:
- Email: `{cityname}@civic.com`
- Password: `admin123`

**Create super admin:**
```bash
npm run create-admin
```
Creates: `superadmin@civic.com` / `super123`

**List all users:**
```bash
npm run list-users
```

### **Default Credentials**
After setup, you'll have access to:
- **Super Admin**: `superadmin@civic.com` / `super123`
- **Mumbai Admin**: `mumbai@civic.com` / `admin123`
- **Pune Admin**: `pune@civic.com` / `admin123`
- **All City Admins**: `{cityname}@civic.com` / `admin123`

## 🏙️ Supported Cities (125+ Maharashtra Cities)

### **Major Cities**
Mumbai, Pune, Nagpur, Aurangabad, Nashik, Thane, Kolhapur, Solapur, Amravati, Nanded, Sangli, Akola, Latur, Dhule, Ahmednagar, Chandrapur, Parbhani, Jalgaon, Bhiwandi, Navi Mumbai, Ulhasnagar, Malegaon, Jalna

### **District Headquarters**
Raigad, Ratnagiri, Sindhudurg, Satara, Osmanabad, Beed, Hingoli, Washim, Buldhana, Yavatmal, Wardha, Bhandara, Gondia, Gadchiroli, Nandurbar, Palghar

### **Industrial & Tourist Centers**
Talegaon Dabhade, Chakan, Hinjawadi, Karad, Miraj, Ichalkaranji, Baramati, Shirdi, Lonavala, Khandala, Matheran, Alibaug, Ganpatipule, Tarkarli, Malvan, Chikhaldara, Toranmal

### **Growing Towns**
Kalyan, Dombivli, Vasai, Virar, Panvel, Badlapur, Ambernath, Karjat, Khopoli, Pen, Mahad, Chiplun, Khed, Guhagar, Dapoli, Vengurla, Sawantwadi, Kudal, Kankavli, Devrukh

*Complete list of 125+ cities available in `server/constants.js` and `client/src/constants/cities.js`*

## 📊 System Limits & Controls

### **Rate Limiting**
- **Cooldown Period**: 15 minutes between issue submissions
- **Daily Limit**: 20 issues per user per day
- **Location Radius**: 50-meter minimum distance between issues
- **File Size**: 10MB maximum for image uploads

### **Trust Score System**
- **Starting Score**: 100 points for new users
- **Verification Bonus**: +5 points for each verified report
- **Spam Penalty**: -25 points for fake reports
- **Challenge Penalty**: No penalty for failed challenges (encourages accountability)
- **Account Suspension**: Automatic when trust score reaches 0

### **Challenge System Limits**
- **Time Window**: 24 hours from admin decision
- **Location Requirement**: Within 50 meters of original issue
- **Photo Similarity**: 50% minimum for acceptance
- **One Attempt**: Single challenge per issue allowed

## 🤖 AI Features & Capabilities

### **Image Analysis**
- **Issue Categorization**: Automatic classification (pothole, garbage, water leak, etc.)
- **Severity Assessment**: 1-10 scale based on visual analysis
- **Relevance Checking**: Filters non-civic infrastructure images
- **Dimension Calculation**: Estimates physical measurements
  - Potholes: Width and depth in centimeters
  - Garbage: Area coverage in square meters
  - Water leaks: Flow rate and affected area

### **Spam Detection**
- **Text Analysis**: Pattern matching for spam content
- **Image Relevance**: AI validates civic infrastructure relation
- **Behavioral Patterns**: Detects suspicious submission patterns
- **Automatic Penalties**: Trust score reduction and account suspension

### **Photo Comparison (Challenge System)**
- **Similarity Scoring**: 0-100% match percentage
- **Confidence Levels**: AI provides certainty ratings
- **Feature Matching**: Compares visual elements and context
- **Automatic Decisions**: Accepts/rejects based on 50% threshold

### **Resolution Verification**
- **Before/After Comparison**: Validates admin resolution photos
- **Completion Scoring**: 0-100% resolution quality
- **Minimum Threshold**: 60% required for issue closure
- **Quality Assurance**: Prevents premature issue closure

## 🗺️ Map Features & Visualization

### **Interactive Maps**
- **City Centering**: Automatic focus on user's/admin's city
- **Zoom Controls**: Optimized levels for city and street view
- **Issue Markers**: Color-coded by priority (red/yellow/green)
- **Click Details**: Popup with issue information and photos

### **Heatmap Visualization**
- **Density Mapping**: Visual representation of issue concentration
- **Priority Weighting**: High-priority issues have stronger heat signatures
- **Toggle Control**: Enable/disable heatmap overlay
- **Real-time Updates**: Reflects current issue status

### **Filtering & Search**
- **Priority Filters**: Show only high/medium/low priority issues
- **Status Filters**: Filter by pending/in-progress/resolved
- **Date Range**: View issues from specific time periods
- **Category Filters**: Filter by issue type (pothole, garbage, etc.)

## 📧 Email Notification System

### **User Notifications**
- **Registration OTP**: 6-digit verification code with 10-minute expiry
- **Issue Resolution**: Professional email with AI score and challenge info
- **Spam Warning**: 24-hour deadline notice with challenge instructions
- **Challenge Updates**: Status notifications throughout appeal process

### **Admin Notifications**
- **New Issues**: Alerts for high-priority reports in their city
- **Challenge Submissions**: Notifications when users appeal decisions
- **System Updates**: Important announcements and feature updates

### **Email Features**
- **Professional Templates**: Responsive HTML design with branding
- **Action Buttons**: Direct links to relevant pages
- **Time Stamps**: Clear deadlines and countdown timers
- **Multi-language Support**: Ready for localization

## 🔐 Security & Authentication

### **Authentication System**
- **JWT Tokens**: Secure access and refresh token mechanism
- **HttpOnly Cookies**: Prevents XSS attacks on tokens
- **Automatic Refresh**: Seamless token renewal
- **Role-Based Access**: User/Admin/Super Admin permissions

### **Data Protection**
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **File Upload Security**: Type and size validation

### **Privacy Controls**
- **City-Based Isolation**: Admins only see their city's data
- **User Data Protection**: Minimal data collection and storage
- **Image Processing**: Automatic metadata removal
- **Audit Trails**: Complete action logging for accountability

## 📱 User Interface & Experience

### **Responsive Design**
- **Mobile-First**: Optimized for smartphones and tablets
- **Desktop Enhanced**: Full-featured desktop experience
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Accessibility**: WCAG guidelines compliance

### **Modern UI Components**
- **Clean Design**: Minimalist, professional appearance
- **Consistent Branding**: Unified color scheme and typography
- **Loading States**: Smooth transitions and feedback
- **Error Handling**: User-friendly error messages and recovery

### **Navigation**
- **Intuitive Menus**: Clear categorization and labeling
- **Breadcrumbs**: Easy navigation tracking
- **Quick Actions**: Prominent buttons for common tasks
- **Search Functionality**: Fast issue and location finding

## 🚀 Deployment & Production

### **Production URLs**
- **Frontend**: https://civic-pluss.vercel.app
- **Backend**: https://civicpluss.onrender.com

### **Deployment Platforms**
- **Frontend**: Vercel (automatic deployments from GitHub)
- **Backend**: Render (containerized Node.js deployment)
- **Database**: MongoDB Atlas (cloud database)
- **Images**: Cloudinary CDN (global image delivery)

### **Performance Optimizations**
- **Image Compression**: Automatic optimization via Cloudinary
- **Caching**: Strategic caching for maps and static content
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **CDN Delivery**: Global content distribution

### **Monitoring & Analytics**
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time and uptime tracking
- **User Analytics**: Usage patterns and feature adoption
- **System Health**: Database and API performance metrics

## 📊 API Documentation

### **Authentication Endpoints**
```
POST /api/v1/auth/register     - User registration with OTP
POST /api/v1/auth/verify-otp   - Email verification
POST /api/v1/auth/login        - User login
POST /api/v1/auth/logout       - Secure logout
POST /api/v1/auth/refresh      - Token refresh
```

### **Issue Management**
```
GET  /api/v1/issue/getAllIssue     - Get all issues (city-filtered)
POST /api/v1/issue/postIssue       - Create new issue
GET  /api/v1/issue/:id              - Get issue details
PUT  /api/v1/issue/updateStatus/:id - Update issue status (admin)
POST /api/v1/issue/reportFake/:id   - Report as fake (admin)
```

### **User Management**
```
GET  /api/v1/user/current          - Get current user profile
PUT  /api/v1/user/profile          - Update user profile
GET  /api/v1/user/stats            - Get user statistics
```

### **Challenge System**
```
POST /api/v1/challenge/submit      - Submit challenge with evidence
GET  /api/v1/challenge/queue       - Get challenge queue (super admin)
PUT  /api/v1/challenge/review/:id  - Review challenge (super admin)
GET  /api/v1/challenge/history     - Get challenge history
GET  /api/v1/challenge/user        - Get user's challenges
```

### **Analytics & Statistics**
```
GET  /api/v1/issue/admin/stats     - Admin dashboard statistics
GET  /api/v1/issue/priority        - Issues by priority
GET  /api/v1/issue/home/stats      - Homepage statistics
```

## 🔧 Configuration & Customization

### **Adjustable Parameters**
```javascript
// Rate Limiting
const COOLDOWN_MINUTES = 15;        // Cooldown between submissions
const DAILY_LIMIT = 20;             // Issues per day per user
const LOCATION_RADIUS = 50;         // Meters between issues

// Trust Score
const VERIFICATION_BONUS = 5;       // Points for verified reports
const SPAM_PENALTY = 25;            // Points deducted for fake reports
const SUSPENSION_THRESHOLD = 0;     // Trust score for account suspension

// Challenge System
const CHALLENGE_WINDOW = 24;        // Hours to submit challenge
const SIMILARITY_THRESHOLD = 50;    // Percentage for photo acceptance
const RESOLUTION_THRESHOLD = 60;    // Percentage for issue closure

// AI Analysis
const PRIORITY_WEIGHTS = {
    severity: 0.50,      // Image analysis weight
    location: 0.30,      // Location impact weight
    frequency: 0.10,     // Issue frequency weight
    time: 0.10          // Time pending weight
};
```

### **City Management**
- **Add New Cities**: Update `constants.js` files in both client and server
- **Create Admins**: Use provided scripts for bulk admin creation
- **Custom Boundaries**: Modify map centering and zoom levels
- **Localization**: Ready for multi-language support

## 🐛 Troubleshooting Guide

### **Common Issues**

#### **Authentication Problems**
- **Symptom**: Login fails or tokens expire immediately
- **Solution**: Check JWT secrets, clear browser cookies, verify MongoDB connection
- **Prevention**: Use strong, unique JWT secrets and proper token expiry times

#### **Map Not Loading**
- **Symptom**: Google Maps shows gray area or errors
- **Solution**: Verify Google Maps API key, check billing account, enable required APIs
- **Prevention**: Monitor API usage and set up billing alerts

#### **AI Analysis Failing**
- **Symptom**: Issues created without AI categorization
- **Solution**: Check Groq API key, verify image format, monitor rate limits
- **Prevention**: Implement fallback categorization and error handling

#### **Email Notifications Not Sent**
- **Symptom**: Users don't receive OTP or notification emails
- **Solution**: Verify Gmail app password, check SMTP settings, test email connectivity
- **Prevention**: Monitor email delivery rates and implement backup providers

#### **Challenge System Issues**
- **Symptom**: Challenges not accepting or location errors
- **Solution**: Check browser location permissions, verify GPS accuracy, test photo upload
- **Prevention**: Provide clear user instructions and fallback options

### **Performance Optimization**
- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Image Optimization**: Use Cloudinary transformations for faster loading
- **Caching Strategy**: Implement Redis for session and data caching
- **API Rate Limiting**: Protect against abuse with request throttling

## 📈 Future Enhancements

### **Planned Features**
- **Mobile App**: React Native version for iOS and Android
- **Multi-language Support**: Marathi, Hindi, and English interfaces
- **Advanced Analytics**: Machine learning for issue prediction
- **Citizen Engagement**: Voting and community discussion features
- **Integration APIs**: Connect with government systems and databases

### **Technical Improvements**
- **Real-time Updates**: WebSocket integration for live notifications
- **Offline Support**: Progressive Web App capabilities
- **Advanced AI**: Computer vision for automatic issue detection
- **Blockchain**: Immutable audit trails for transparency
- **IoT Integration**: Sensor data for proactive issue detection

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👨‍💻 Support & Contact

For technical support, feature requests, or bug reports:
- Review the troubleshooting section above
- Check existing GitHub issues
- Create new issue with detailed description
- Include error logs and reproduction steps

## 🏆 Acknowledgments

- **Maharashtra Government**: For civic infrastructure data and support
- **Google Maps**: For location services and visualization
- **Groq**: For AI-powered image analysis capabilities
- **Cloudinary**: For image processing and CDN services
- **MongoDB**: For reliable database infrastructure

---

**Built with ❤️ for smarter, more responsive cities across Maharashtra**

*CivicPulse - Empowering citizens, enabling administrators, ensuring accountability*