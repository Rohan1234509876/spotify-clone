import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express';
import fs from "fs";
import fileupload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cron from "node-cron";

// Initialize environment
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Basic Middleware (CORS first)
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.PRODUCTION_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Safe Clerk Middleware Implementation
try {
    const clerkConfig = {
        debug: false,
        // Disable path-to-regexp internal parsing
        pathRegexOptions: null  
    };
    app.use(clerkMiddleware(clerkConfig));
    console.log("Clerk middleware initialized successfully");
} catch (err) {
    console.error("Clerk initialization failed:", err);
    process.exit(1);
}

// 3. File Uploads
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/uploads',
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 }
}));

// 4. Temp File Cleanup
cron.schedule("0 * * * *", cleanTempFiles);

async function cleanTempFiles() {
    const tempDir = '/tmp/uploads';
    try {
        if (fs.existsSync(tempDir)) {
            const files = await fs.promises.readdir(tempDir);
            await Promise.all(files.map(file => 
                fs.promises.unlink(path.join(tempDir, file))
            ));
        }
    } catch (err) {
        console.error("Temp cleanup error:", err);
    }
}

// 5. Route Loading with Validation
function loadRoutes() {
    const routes = [
        { path: '/api/auth', router: './routes/auth.route.js' },
        { path: '/api/users', router: './routes/user.route.js' },
        { path: '/api/admin', router: './routes/admin.route.js' },
        { path: '/api/albums', router: './routes/album.route.js' },
        { path: '/api/stats', router: './routes/stat.route.js' },
        { path: '/api/songs', router: './routes/song.route.js' }
    ];

    routes.forEach(async (route) => {
        try {
            const routerModule = await import(route.router);
            app.use(route.path, routerModule.default);
            console.log(`Route loaded: ${route.path}`);
        } catch (err) {
            console.error(`Failed to load route ${route.path}:`, err);
        }
    });
}

// 6. Production Configuration
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
}

// 7. Final Error Handling
app.use((err, req, res, next) => {
    console.error('Final Error Handler:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { 
            message: err.message,
            stack: err.stack 
        })
    });
});

// 8. Database Connection and Server Start
(async () => {
    try {
        await connectDB();
        loadRoutes();
        
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error("Server startup failed:", err);
        process.exit(1);
    }
})();

export default app;