import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generatedAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';
import uploadImageClodinary from '../utils/uplodeimageClodinary.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import generatedOtp from '../utils/generateOtp.js';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


// register controller
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

// verify email controller
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

       

        //generate refresh token and update in database
        const accesstoken = await generateAccessToken(user._id)
        const refreshtoken = await generateRefreshToken(user._id)

        const cookieOptions = {
            httponly : true,
            secure  : true,
            sameSite : "none",

        }
        response.cookie('accessToken',accesstoken,cookieOptions)
        response.cookie('refreshToken',refreshtoken,cookieOptions)

        return response.status(200).json({
            message : "Login successful",
            error : false,
            sucess : true,
            data : {
                accesstoken,
                refreshtoken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
    }
}

//logout controller
export async function logoutController(request,response) {
    try {
        const userid = request.userId;
        const cookieOptions = {
            httponly : true,
            secure  : true,
            sameSite : "none",
        }
        response.clearCookie('accessToken', cookieOptions);
        response.clearCookie('refreshToken', cookieOptions);


        const removeRefreshToken = await UserModel.findByIdAndUpdate(
            userid ,
            { refresh_token : "" }
        )

        return response.status(200).json({
            message : "Logout successful",
            error : false,
            sucess : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
    }
}

//uplode user avatar using clodinary
export async function uplodeAvatar(request,response) {
    try {
        const userid = request.userId;// this is comming from auth middleware after verifying the access token
        const image = request.file;//this is coming from multer middleware

        const uplode = await uploadImageClodinary(image)
        console.log("image",image)

        const updateUser = await UserModel.findByIdAndUpdate(
            userid,
            {
                avatar : uplode.url
            })
        
        // return response.status(200).json({
        //     message : "Image uploded successfully",
        //     error : false,
        //     sucess : true,
        //     data : updateUser
        // })

        return response.status(200).json({
            message : "uplode profile complete",
            data :{
                _id : userid,
                avatar : uplode.url
            }
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            info : "this is coming from the uplode avathar controller catch part",
            error : true,
            sucess : false
        })
    }
}

//update user detiles controller
export async function updateUserDetilesController(request,response) {
    try {
        const userId = request.userId;
        const {name,email,mobile,password} = request.body;
        let hashedPassword= ""
        if(password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
           {
            ...(name && { name : name }),
            ...(email && { email : email }),
            ...(mobile && { mobile : mobile }),
            ...(password && { password : hashedPassword })
           },
           {
            new : true
           }
        )
        
        return response.status(200).json({
            message : "User detiles updated successfully",
            error : false,
            sucess : true,
            data : updateUser
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            info : "this is coming from the update user detiles controller catch part",
            error : true,
            sucess : false  
        })
    }
}


// forgit password controller
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from learn_microservice",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return response.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//verify forgot password otp
export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//referestoken (using this increasing life of access 
// token without login again and again after access token expired)

//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.JWT_SECRET_KEY)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?.id

        const newAccessToken = await generateAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.userId

        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}