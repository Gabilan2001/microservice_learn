import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
const generateRefreshToken = async (userID) => {
    const token = jwt.sign(
        { id : userID }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: '7d' }
    );

    const updateRefreshToken = await UserModel.updateOne(
        { _id : userID },
        {refresh_token : token}
    )
    
    return token;
}
export default generateRefreshToken;