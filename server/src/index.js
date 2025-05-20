import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express'
import fs from "fs";
import authRoutes from "./routes/auth.route.js";
import fileupload from "express-fileupload";
import path from "path";
import cors from "cors";
import cron from "node-cron";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import songRoutes from "./routes/song.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

app.use(express.json());  //to parse req.body

app.use(clerkMiddleware());
app.use(cors(
    {
        origin : 'http://localhost:3000',
        credentials : true,
    }
));

app.use(fileupload({
    useTempFiles : true,
    tempFileDir : path.join(path.resolve(),'tmp'),
    createParentPath : true,
    limits : {
        fileSize : 100 * 1024 * 1024, //100mb
    },
}))

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/albums',albumRoutes);
app.use('/api/stats',statRoutes);
app.use('/api/songs',songRoutes);


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../client/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
	});
}


    app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
})

