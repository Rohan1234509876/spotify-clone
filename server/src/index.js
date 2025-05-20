import express from "express";
import dotenv from "dotenv";
// import { clerkMiddleware } from "@clerk/express";
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

// 1) Load env
dotenv.config();

// 2) ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 3) CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.PRODUCTION_URL,
    credentials: true,
  })
);

// 4) Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5) (Global Clerk middleware disabled to avoid path-to-regexp issues))
// app.use(clerkMiddleware({ debug: false }));

// 6) File uploads
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 },
  })
);

// 7) Cron cleanup
cron.schedule("0 * * * *", async () => {
  const tempDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tempDir)) return;
  const files = await fs.promises.readdir(tempDir);
  await Promise.all(files.map((f) => fs.promises.unlink(path.join(tempDir, f))));
});

// 8) Mount routers with isolated try/catch
const mounts = [
  ["/api/auth", authRoutes],
  ["/api/users", userRoutes],
  ["/api/admin", adminRoutes],
  ["/api/albums", albumRoutes],
  ["/api/stats", statRoutes],
  ["/api/songs", songRoutes],
];

mounts.forEach(([routePath, routerModule]) => {
  try {
    app.use(routePath, routerModule);
    console.log(`Mounted ${routePath}`);
  } catch (err) {
    console.error(`Error mounting ${routePath}:`, err);
  }
});

// 9) Serve client in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// 10) Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      message: err.message,
      stack: err.stack,
    }),
  });
});

// 11) Connect DB & start
;(async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
