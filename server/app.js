import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CORS_ORIGIN,
            'https://civic-pluss.vercel.app',
            'http://localhost:5173',
            'http://localhost:5174',
        ];

        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any local network IP on port 5173 or 5174
        // This covers 192.168.x.x, 10.x.x.x, 172.16-31.x.x
        const isLocalNetwork = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)\d+\.\d+:(5173|5174)$/.test(origin);

        if (allowedOrigins.includes(origin) || isLocalNetwork) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true
}))

app.use(express.json({
    limit: '50kb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '50kb'
}));

app.use(express.static('public'));

app.use(cookieParser());

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import issueRoutes from "./routes/issue.route.js";
import challengeRoutes from "./routes/challenge.route.js";
import notificationRoutes from "./routes/notification.route.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/issue", issueRoutes);
app.use("/api/v1/challenge", challengeRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode !== 401) {
        console.error('Error:', err.message);
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        statusCode: statusCode
    });
});

export { app };