import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express';
import fs from "fs";
import fileupload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cron from "node-cron";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import songRoutes from "./routes/song.route.js";
import { connectDB } from "./lib/db.js";

// Configure file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize environment variables
dotenv.config();

const app = express();

// 1. Middleware Ordering (Critical Fix)
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.PRODUCTION_URL,
    credentials: true
}));

// 2. Updated Clerk Middleware Configuration
app.use(clerkMiddleware({
    debug: true,
    pathRegexOptions: {
        strict: false,
        sensitive: false,
        end: false
    }
}));

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(path.resolve(), 'tmp'),
    createParentPath: true,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
}));

// Cron job for temp file cleanup
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
    if (fs.existsSync(tempDir)) {
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                console.error("Temp file cleanup error:", err);
                return;
            }
            files.forEach(file => {
                fs.unlink(path.join(tempDir, file), err => {
                    if (err) console.error("Error deleting temp file:", file, err);
                });
            });
        });
    }
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/songs', songRoutes);

// 4. Production static files (moved before catch-all)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
}

// 5. Error Handling Middleware (Critical Fix)
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Catch-all route for client-side routing
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
    });
}

// Database connection and server start
connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(err => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });

export default app;