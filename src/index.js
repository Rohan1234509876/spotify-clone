import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express'
import authRoutes from "./routes/auth.route.js";
import fileupload from "express-fileupload";
import path from "path";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import albumRoutes from "./routes/album.route.js";
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

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/albums',albumRoutes);
app.use('/api/stats',albumRoutes);
app.use('/api/songs',songRoutes);


    app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
})

