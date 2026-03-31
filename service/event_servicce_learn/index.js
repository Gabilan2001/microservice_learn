import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import eventRouter from "./route/event.route.js";

const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet({
    contentSecurityPolicy: false,
}))

const PORT = 8081 || process.env.PORT;
app.get("/",(req,res)=>{
    res.json({
        message : "Event service is running on port " + PORT
    })
})

app.use("/api/event", eventRouter);

    connectDB().then(()=>{
        app.listen(PORT,()=>{
        console.log("Event service is running on port",PORT)
    })

})