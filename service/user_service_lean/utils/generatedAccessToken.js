import jwt from 'jsonwebtoken';
const generateAccessToken = async(userID) => {
    const token = jwt.sign(
        { id : userID }, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: '1h' }
    );
    
    return token;
};

export default generateAccessToken;