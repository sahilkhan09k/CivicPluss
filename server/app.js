import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: [process.env.CORS_ORIGIN, 'https://civic-pluss.vercel.app', 'http://localhost:5173'],
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/issue", issueRoutes);

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