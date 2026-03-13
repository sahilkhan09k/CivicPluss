# 📦 Complete Dependencies List for CivicPulse

## 🖥️ Server Dependencies

### Production Dependencies
```bash
npm install @google/generative-ai@^0.24.1 bcrypt@^5.1.1 cloudinary@^1.41.0 cookie-parser@^1.4.6 cors@^2.8.5 dotenv@^16.3.1 exifreader@^4.36.1 express@^4.18.2 groq-sdk@^0.7.0 jsonwebtoken@^9.0.2 mongoose@^8.0.0 multer@^1.4.5-lts.1 nodemailer@^8.0.1 openai@^6.18.0 resend@^6.9.2 sharp@^0.34.5 socket.io@^4.8.3
```

### Development Dependencies
```bash
npm install -D nodemon@^3.0.1
```

### Individual Package Explanations:
- **@google/generative-ai**: Google's Generative AI SDK for AI analysis
- **bcrypt**: Password hashing and comparison
- **cloudinary**: Image upload and storage service
- **cookie-parser**: Parse HTTP cookies
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable loader
- **exifreader**: Extract EXIF data from images
- **express**: Web framework for Node.js
- **groq-sdk**: Groq AI API client for image analysis
- **jsonwebtoken**: JWT token generation and verification
- **mongoose**: MongoDB object modeling
- **multer**: File upload middleware
- **nodemailer**: Email sending (Gmail integration)
- **openai**: OpenAI API client (backup AI service)
- **resend**: Modern email API service (primary email service)
- **sharp**: Image processing and optimization
- **socket.io**: Real-time communication for notifications
- **nodemon**: Development server with auto-restart

## 🌐 Client Dependencies

### Production Dependencies
```bash
npm install @googlemaps/markerclusterer@^2.6.2 @react-google-maps/api@^2.20.8 lucide-react@^0.563.0 react@^19.2.0 react-dom@^19.2.0 react-router-dom@^7.13.0 recharts@^3.7.0 socket.io-client@^4.8.3
```

### Development Dependencies
```bash
npm install -D @eslint/js@^9.39.1 @tailwindcss/postcss@^4.1.18 @types/react@^19.2.5 @types/react-dom@^19.2.3 @vitejs/plugin-react@^5.1.1 autoprefixer@^10.4.24 eslint@^9.39.1 eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.4.24 globals@^16.5.0 postcss@^8.5.6 tailwindcss@^4.1.18 vite@^7.2.4
```

### Individual Package Explanations:
- **@googlemaps/markerclusterer**: Cluster map markers for better performance
- **@react-google-maps/api**: React wrapper for Google Maps API
- **lucide-react**: Modern icon library
- **react**: React library (latest version)
- **react-dom**: React DOM rendering
- **react-router-dom**: Client-side routing
- **recharts**: Chart and analytics library
- **socket.io-client**: Client-side real-time communication
- **@eslint/js**: ESLint JavaScript configuration
- **@tailwindcss/postcss**: Tailwind CSS PostCSS plugin
- **@types/react**: TypeScript types for React
- **@types/react-dom**: TypeScript types for React DOM
- **@vitejs/plugin-react**: Vite plugin for React
- **autoprefixer**: CSS vendor prefixing
- **eslint**: JavaScript linting
- **eslint-plugin-react-hooks**: ESLint rules for React hooks
- **eslint-plugin-react-refresh**: ESLint rules for React refresh
- **globals**: Global variables for ESLint
- **postcss**: CSS transformation tool
- **tailwindcss**: Utility-first CSS framework
- **vite**: Fast build tool and dev server

## 🚀 Quick Installation Commands

### For Server (run in server directory):
```bash
# All at once (latest versions)
npm install @google/generative-ai bcrypt cloudinary cookie-parser cors dotenv exifreader express groq-sdk jsonwebtoken mongoose multer nodemailer openai resend sharp socket.io
npm install -D nodemon

# Or with exact versions
npm install @google/generative-ai@^0.24.1 bcrypt@^5.1.1 cloudinary@^1.41.0 cookie-parser@^1.4.6 cors@^2.8.5 dotenv@^16.3.1 exifreader@^4.36.1 express@^4.18.2 groq-sdk@^0.7.0 jsonwebtoken@^9.0.2 mongoose@^8.0.0 multer@^1.4.5-lts.1 nodemailer@^8.0.1 openai@^6.18.0 resend@^6.9.2 sharp@^0.34.5 socket.io@^4.8.3
npm install -D nodemon@^3.0.1
```

### For Client (run in client directory):
```bash
# All at once
npm install @googlemaps/markerclusterer @react-google-maps/api lucide-react react react-dom react-router-dom recharts socket.io-client
npm install -D @eslint/js @tailwindcss/postcss @types/react @types/react-dom @vitejs/plugin-react autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals postcss tailwindcss vite

# Or with exact versions
npm install @googlemaps/markerclusterer@^2.6.2 @react-google-maps/api@^2.20.8 lucide-react@^0.563.0 react@^19.2.0 react-dom@^19.2.0 react-router-dom@^7.13.0 recharts@^3.7.0 socket.io-client@^4.8.3
npm install -D @eslint/js@^9.39.1 @tailwindcss/postcss@^4.1.18 @types/react@^19.2.5 @types/react-dom@^19.2.3 @vitejs/plugin-react@^5.1.1 autoprefixer@^10.4.24 eslint@^9.39.1 eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.4.24 globals@^16.5.0 postcss@^8.5.6 tailwindcss@^4.1.18 vite@^7.2.4
```

## 📋 Complete Package.json Files

### Server package.json:
```json
{
  "name": "civicplus-server",
  "version": "1.0.0",
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
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "bcrypt": "^5.1.1",
    "cloudinary": "^1.41.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "exifreader": "^4.36.1",
    "express": "^4.18.2",
    "groq-sdk": "^0.7.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^8.0.1",
    "openai": "^6.18.0",
    "resend": "^6.9.2",
    "sharp": "^0.34.5",
    "socket.io": "^4.8.3"
  }
}
```

### Client package.json:
```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@googlemaps/markerclusterer": "^2.6.2",
    "@react-google-maps/api": "^2.20.8",
    "lucide-react": "^0.563.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "recharts": "^3.7.0",
    "socket.io-client": "^4.8.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.24",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "vite": "^7.2.4"
  }
}
```

## ⚠️ Important Notes

1. **Resend is included** - Used for email services alongside nodemailer
2. **Socket.io** - Both server and client versions for real-time notifications
3. **Sharp** - Required for image processing and optimization
4. **ExifReader** - Extracts metadata from uploaded images
5. **Multiple AI services** - Google Generative AI, Groq SDK, and OpenAI for redundancy
6. **Latest React** - Using React 19.2.0 with latest features
7. **Tailwind CSS 4** - Latest version with new features
8. **ES Modules** - Both server and client use `"type": "module"`

## 🔧 Troubleshooting

### If you get dependency conflicts:
```bash
# Use --legacy-peer-deps flag
npm install --legacy-peer-deps

# Or use --force flag
npm install --force
```

### If Sharp fails to install:
```bash
# Install Sharp separately
npm install sharp --platform=linux --arch=x64
```

### If Socket.io versions mismatch:
```bash
# Ensure both server and client use same major version
npm install socket.io@^4.8.3        # Server
npm install socket.io-client@^4.8.3 # Client
```