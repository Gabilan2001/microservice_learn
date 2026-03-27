import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';


export async function registerUserController(request,response) {
    try {
        const { name, email, password } = request.body;
        if(!name || !email || !password) {
            return response.status(400).json({
                message : "All fields are required",
                error : true,
                sucess : false
            })
        }

        const user = await UserModel.findOne({
            email
        })
        if(user) {
            return response.status(400).json({
                message : "User already exists",
                error : true,
                sucess : false
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const payload = {
            name,
            email,
            password : hashedPassword
        }
        
        const newUser = await UserModel(payload)
        const save = await newUser.save();

        const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`
        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Welcome to LEARN",
            html : verifyEmailTemplate({
                name,
                url : verifyEmailUrl
            })
        })
        return response.status(200).json({
            message : "User registered successfully",
            error : false,
            sucess : true,
            data : save
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
    }
    
}

export async function verifyEmailController(request,response) {
    try {

        const { code } = request.body

        const user = await UserModel.findOne({
            _id : code
        })
        
        if(!user) {
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                sucess : false
            })
        }

        const updateuser = await UserModel.updateOne({
            _id : code
        },{
            verify_email : true
        })
        return response.status(200).json({
            message : "Email verified successfully",
            error : false,
            sucess : true,
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
    }
}

//logincontroller
export async function loginController(request,response) {
    try {
        const { email, password } = request.body;
        if(!email || !password) {
            return response.status(400).json({
                message : "All fields are required",
                error : true,
                sucess : false
            })
        }
        const user =await UserModel.findOne({
            email
        })
        if(!user) {
            return response.status(400).json({
                message : "User does not exist",
                error : true,
                sucess : false
            })
        }
        
        if (user.status !== "Active") {
            return response.status(400).json({
                message : "User is not active",
                error : true,
                sucess : false
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return response.status(400).json({
                message : "Invalid credentials",
                error : true,
                sucess : false
            })
        }
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
    }
}