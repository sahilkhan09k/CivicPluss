# CivicPulse - Smart City Issue Reporting Platform

A comprehensive full-stack web application for reporting and managing civic infrastructure issues across all 125+ Maharashtra cities with AI-powered analysis, real-time maps, trust score system, and advanced challenge/appeal mechanisms.

---

## 🏆 Unique Selling Propositions (USPs)

> What makes CivicPulse fundamentally different from any other civic issue reporting platform — and why it works.

---

### 1. 🤖 Intelligent Prioritization Engine

Most civic platforms treat all issues equally — a broken streetlight gets the same attention as a pothole outside a hospital. CivicPulse solves this with a **multi-factor AI-driven priority scoring system** that calculates a 0–100 score for every issue the moment it is submitted.

#### How It Works — The Formula

```
Priority Score = (Severity × 0.40) + (Location Impact × 0.35) + (Time Pending × 0.20) + (Frequency × 0.05) + AI Urgency Boost
```

**Factor 1 — Severity (40% weight)**

Severity is calculated using a **hybrid AI approach** combining two independent signals:

- **Text Analysis (80% of severity):** The issue title and description are sent to **Groq's LLaMA 3.3 70B model** via the Groq SDK. The model returns a severity score (1–10), issue category, urgency boost, and a relevance check. If the text is not related to civic infrastructure (e.g., random text, jokes), the submission is rejected outright.
- **Image Analysis (20% of severity):** The uploaded photo is analyzed by a separate AI pipeline (`aiAnalyzeImage.js`) that assesses visual severity and also estimates **physical dimensions** — for example, pothole width and depth in centimeters, garbage area in square meters, or water leak flow rate. These dimensions are stored in the database and displayed to admins.
- The two signals are combined: `combinedSeverity = (textSeverity × 0.8) + (imageSeverity × 0.2)`, then scaled to a 0–100 score.

**Factor 2 — Location Impact (35% weight)**

This is the most technically sophisticated factor. Rather than relying on keywords the user types (which can be gamed), CivicPulse uses the **GPS coordinates** of the issue to query the **Google Places Nearby Search API** with a 200-meter radius. The system detects what is actually near the issue location:

| Score | Trigger | Examples |
|-------|---------|---------|
| **95** | High-impact facility nearby | Hospital, School, Police station, Airport, Train station |
| **80** | Main road / highway | Highway, arterial road, main road |
| **70** | Medium-impact place nearby | Market, Bank, Pharmacy, Park, Stadium |
| **45** | Residential / default | No significant places nearby |

If multiple factors are present (e.g., a pothole near both a hospital AND on a main road), a **cumulative bonus system** applies: the highest base score is taken, then +5 is added per additional factor, capped at 100. This means a pothole near a hospital on a main road scores 100 — the maximum possible location impact.

**Factor 3 — Time Pending (20% weight)**

Issues that remain unresolved compound in urgency over time. The time score uses an **aging multiplier**:

| Age | Score | Urgency Level |
|-----|-------|--------------|
| < 6 hours | 10 | Just reported |
| 6–24 hours | 25 | Low urgency |
| 1–3 days | 50 | Moderate urgency |
| 3–7 days | 75 | High urgency |
| 7+ days | 100 | Critical — needs immediate attention |

This means an issue that was ignored for a week automatically escalates to maximum time urgency, pushing it to the top of the admin queue without any manual intervention.

**Factor 4 — Frequency (5% weight)**

Nearby duplicate reports (within a 50-meter radius) contribute a small frequency score. This is intentionally weighted low because the platform already deduplicates issues — if 8 or more reports exist within 50 meters, new submissions are blocked and users are directed to upvote existing reports instead.

**AI Urgency Boost**

On top of the base score, the Groq LLM can add up to +15 urgency boost points if it detects critical keywords like "dangerous", "emergency", "hazard", or high-impact location mentions in the description. This boost is added after the base score calculation.

**Priority Labels**

| Score | Label |
|-------|-------|
| ≥ 70 | 🔴 High |
| 45–69 | 🟡 Medium |
| < 45 | 🟢 Low |

**Technologies Used:** Groq SDK (LLaMA 3.3 70B), Google Places Nearby Search API, Google Geocoding API, Cloudinary (image hosting for AI analysis), Node.js, MongoDB

---

### 2. 🏛️ Three-Level Power Architecture

CivicPulse implements a carefully designed **three-tier governance model** that mirrors how real municipal systems work — with clear separation of powers, accountability at every level, and checks and balances built in.

#### Level 1 — Citizens (Users)

Citizens are the foundation of the platform. They can:
- Report civic issues with photo evidence and GPS location
- Track the status of their own reports in real time
- **Upvote** other citizens' issues to signal community importance (each upvote gives the reporter +2 trust score and boosts the issue's visibility)
- **Challenge admin decisions** within a 24-hour window if they believe a resolution or spam marking was incorrect
- View their **Trust Score** — a credibility metric that starts at 100 and changes based on their reporting behavior

Citizens are subject to **rate limiting**: a 15-minute cooldown between submissions and a maximum of 20 issues per day, preventing spam while allowing genuine reporting.

#### Level 2 — City Admins

Each of the 125+ Maharashtra cities has a dedicated admin account (`{cityname}@civic.com`). City admins can only see and manage issues within their assigned city — they have no access to other cities' data. Their responsibilities include:
- Moving issues from Pending → In Progress → Resolved
- Uploading resolution photos (which are AI-verified before the issue can be closed)
- Marking issues as Spam/Fake (which triggers the trust score penalty system)
- Viewing city-specific analytics, heatmaps, and performance metrics

When a city admin marks an issue as resolved, they must upload a resolution photo. The system then uses **AI photo comparison** (Groq Vision API) to compare the original issue photo with the resolution photo and calculate a `resolvedScore` (0–100%). If the score is below 60%, the resolution is rejected — the admin cannot close the issue without genuine proof of completion. This prevents admins from falsely marking issues as resolved.

#### Level 3 — Super Admin

The Super Admin has cross-city visibility and serves as the **final arbiter** of the platform. Their exclusive capabilities include:
- Viewing all issues across all 125+ cities simultaneously
- Reviewing the **Challenge Queue** — when a citizen successfully challenges an admin decision (photo similarity > 50%), the challenge is escalated to the Super Admin for final review
- Making final decisions: "Admin Was Wrong" (issue restored, admin accountability tracked) or "Admin Was Correct" (challenge rejected)
- Viewing **Admin Performance Metrics** — overturn rates, decision quality scores, and challenge history for every city admin
- Accessing state-wide analytics and trend data

This three-level architecture ensures that no single actor has unchecked power. Citizens can challenge admins. Admins are accountable to the Super Admin. The Super Admin's decisions are logged and auditable.

**Technologies Used:** JWT authentication with role-based access control, MongoDB city-based data isolation, Express.js middleware (`requireAdmin`, `verifyJWT`), Socket.IO for real-time notifications

---

### 3. 🛡️ Multi-Layer Spam Prevention System

Spam and fake reports are the biggest threat to any civic platform's credibility. CivicPulse implements **five independent layers of spam prevention** that work together to maintain data quality.

#### Layer 1 — Content Validation (Pre-submission)

Before an issue is even processed, the title and description pass through a **regex-based spam detection engine** (`spamDetection.js`):
- Rejects repeated characters (e.g., "aaaaaaa", "11111")
- Blocks submissions containing only special characters
- Filters commercial spam keywords (buy, sell, cheap, free, click, promo, discount)
- Blocks URLs in descriptions
- Rejects long number sequences (phone numbers)
- Enforces minimum meaningful content: title must have ≥ 2 words of ≥ 3 characters; description must have ≥ 3 meaningful words

#### Layer 2 — AI Relevance Check (Pre-submission)

Even if content passes the regex filter, the Groq LLM performs a **semantic relevance check**. The model determines whether the submission is genuinely about a civic infrastructure issue. If `isRelevant: false` is returned, the submission is rejected with a user-friendly error message. This catches creative spam that bypasses keyword filters.

#### Layer 3 — Image Relevance Check (Pre-submission)

The uploaded image is analyzed by the AI image pipeline to verify it shows a civic infrastructure problem. Non-civic images (selfies, random photos, screenshots) are rejected before the issue is created.

#### Layer 4 — Location Deduplication (Pre-submission)

The system checks for existing issues within a **50-meter radius** (calculated using coordinate bounding boxes). If 8 or more reports already exist at that location, the new submission is blocked. This prevents coordinated spam attacks targeting a single location.

#### Layer 5 — Trust Score System with Delayed Penalties (Post-submission)

When an admin marks an issue as Spam/Fake, the system does **not** immediately penalize the user. Instead:
1. The issue is flagged and the user is notified via email
2. A **24-hour challenge window** opens — the user can appeal the decision
3. If the user does not challenge within 24 hours, the `trustScoreScheduler.js` (which runs every hour via `setInterval`) automatically applies a **-25 trust score penalty**
4. If the user's trust score reaches 0, their account is automatically suspended and their email is added to a permanent ban list (`BannedEmail` model) — preventing re-registration
5. If the user successfully challenges the decision (see USP #2), no penalty is applied

The scheduler also sends **progressive warning notifications** at trust score thresholds of 50, 25, and 10, giving users clear feedback before suspension.

**Technologies Used:** Node.js regex engine, Groq LLaMA 3.3 70B (semantic relevance), MongoDB geospatial queries, `setInterval` scheduler, Nodemailer (Gmail SMTP) for email notifications, Socket.IO for real-time in-app notifications

---

### 4. 📊 Advanced Visualization Tools

CivicPulse provides rich, data-driven visualization tools for both admins and citizens — turning raw issue data into actionable geographic and temporal intelligence.

#### Issue Density Heatmap (City Map)

The public-facing City Map page renders all active issues on a **Google Maps** canvas with a custom density heatmap overlay. The heatmap is built using **Google Maps Circle overlays** rather than the standard HeatmapLayer, giving finer control over appearance:
- Each issue contributes a circle centered on its GPS coordinates with a 500-meter radius
- Circle **opacity** scales with local density: `opacity = min(0.15 + (density × 0.05), 0.4)`
- Circle **color** reflects priority: red for High, yellow for Medium, green for Low
- Users can toggle the heatmap on/off
- The map auto-centers on the user's city with zoom level 13

#### Admin Dashboard — Problem Zone Detection

The Admin Dashboard includes a **Top 5 Problem Zones** panel that groups issues by approximate location (0.01 degree precision, roughly 1km grid squares) and identifies the highest-density clusters. Each zone shows issue count, priority level, and GPS coordinates. The map also renders **dynamic circles** for the top 3 zones with radius proportional to issue count (`radius = max(300, issueCount × 100)` meters).

#### Weekly Trend Charts

The Admin Dashboard renders a **7-day bar chart** (using Recharts) showing reported vs. resolved issues per day. This gives admins an immediate visual of their resolution velocity and backlog trends.

#### Analytics Page — Multi-Chart Dashboard

The dedicated Analytics page provides:
- **Pie chart** — Issues by priority distribution (using Recharts PieChart)
- **Bar chart** — Top problem zones by issue count
- **Line chart** — Weekly activity trend (reported vs. resolved over 7 days)
- **Key metrics** — Total issues, resolution rate percentage, average response time, citizen satisfaction score

#### Resolution Verification Score Visualization

When an admin resolves an issue, the AI comparison score is displayed as a **color-coded progress bar** in both the admin and user interfaces:
- Green (≥ 80%): Excellent resolution
- Yellow (60–79%): Good resolution
- Red (< 60%): Rejected — resolution not verified

**Technologies Used:** Google Maps JavaScript API (`@react-google-maps/api`), Google Maps Circle overlays, Recharts (BarChart, LineChart, PieChart), MongoDB aggregation for zone clustering, Node.js date arithmetic for weekly trends

---

### 5. ⚖️ Two-Level Challenge & Appeal System

This is CivicPulse's most unique feature — a **formal appeals process** that gives citizens legal-style recourse against admin decisions, with AI-powered evidence verification.

#### How It Works

When an admin marks an issue as Resolved or Spam, a **24-hour countdown timer** appears on the user's issue detail page. Within this window, the user can:

1. **Initiate a challenge** — they must physically go to the original issue location
2. **Location verification** — the browser's Geolocation API checks that the user is within **50 meters** of the original issue coordinates (using haversine distance calculation)
3. **Live photo capture** — the user must take a new photo using their device camera (gallery uploads are blocked via `capture="environment"` HTML attribute)
4. **AI photo comparison** — the new photo is compared against the original issue photo using **Groq Vision API**, producing a similarity score (0–100%)
5. **Automatic decision** — if similarity > 50%, the challenge is accepted and escalated to the Super Admin; if ≤ 50%, it is automatically rejected

The Super Admin then reviews accepted challenges with a side-by-side photo comparison interface and makes the final decision. If the admin was wrong, the issue is restored to its original state and the admin's overturn rate increases. If the admin was correct, the challenge is rejected.

**Technologies Used:** HTML5 Geolocation API, Haversine distance formula, Groq Vision API (photo comparison), MongoDB transactions (atomic state restoration), Socket.IO (real-time challenge notifications), Nodemailer (email notifications at each stage)

---

### 6. ⏰ Automatic Issue Escalation (7-Day Rule)

Issues that remain unresolved for 7+ days are **automatically escalated** through the priority scoring system without any manual intervention. This is implemented through the **time-pending factor** in the priority score formula:

- At 7+ days, the time score reaches its maximum value of **100**
- Since time pending carries 20% weight, this adds up to 20 points to the priority score
- Combined with severity and location factors, a week-old issue near a hospital can reach a priority score of 95–100
- The admin dashboard's "Critical Unresolved" counter specifically tracks High-priority issues that remain unresolved, creating visible accountability pressure

This means admins cannot simply ignore issues — the longer an issue sits unresolved, the higher it climbs in the priority queue, making it impossible to bury.

---

### 7. 🔐 Trust Score Economy

The Trust Score system creates a **self-regulating community** where good behavior is rewarded and bad behavior is penalized — without requiring manual moderation for every action.

| Action | Trust Score Change |
|--------|-------------------|
| Issue verified/upvoted by community | +2 per upvote |
| Issue marked as Spam by admin (unchallenged) | -25 after 24 hours |
| Challenge won (admin was wrong) | No penalty |
| Challenge lost (admin was correct) | -50 |
| Trust score reaches 0 | Account suspended + email banned |

The delayed penalty system (24-hour window before -25 is applied) is a deliberate design choice: it gives genuine users time to appeal while still penalizing bad actors who don't bother to challenge. The scheduler runs every hour, checking for expired challenge windows and applying penalties automatically.

---

### 8. 📧 Automated Email Notification Pipeline

Every significant event in the platform triggers an automated email via **Nodemailer with Gmail SMTP**:

- **Registration**: OTP verification email with 6-digit code (10-minute expiry)
- **Issue Resolved**: Professional HTML email with AI verification score, color-coded progress bar, and 24-hour challenge window information
- **Issue Marked Spam**: Warning email with exact deadline timestamp, trust score penalty explanation, and step-by-step challenge instructions
- **Challenge Updates**: Notifications at each stage (submitted, accepted/rejected, reviewed)

All emails use responsive HTML templates with CivicPulse branding, action buttons, and clear calls-to-action.

---

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