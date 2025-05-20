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

// Load environment variables
dotenv.config();

// ESM-friendly __dirname
typeof __dirname === 'undefined' && (() => {
  const __filename = fileURLToPath(import.meta.url);
  global.__dirname = path.dirname(__filename);
})();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.PRODUCTION_URL,
  credentials: true
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware
app.use(clerkMiddleware());
console.log("Clerk middleware initialized successfully");

// File uploads
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "tmp"),
  createParentPath: true,
  limits: { fileSize: 100 * 1024 * 1024 }
}));

// Scheduled temp file cleanup every hour
cron.schedule("0 * * * *", async () => {
  const tempDir = path.join(__dirname, "tmp");
  try {
    if (fs.existsSync(tempDir)) {
      const files = await fs.promises.readdir(tempDir);
      await Promise.all(files.map(file => fs.promises.unlink(path.join(tempDir, file))));
    }
  } catch (err) {
    console.error("Temp cleanup error:", err);
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/songs', songRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message, stack: err.stack })
  });
});

// Async startup
(async () => {
  try {
    await connectDB();

    // Log all registered routes for debugging in non-production
    if (process.env.NODE_ENV !== 'production' && app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
          console.log('ROUTE:', methods, layer.route.path);
        }
      });
    }

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
