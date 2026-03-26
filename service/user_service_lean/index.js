import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));

app.use(express.json())
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet ({
    contentSecurityPolicy: false,
}))

const PORT = 8080 || process.env.PORT
app.get('/',(req,res)=>{
    res.json({
        message : "server is running" + PORT
    })

})
app.listen(PORT,()=>{
    console.log("server is running",PORT)
})