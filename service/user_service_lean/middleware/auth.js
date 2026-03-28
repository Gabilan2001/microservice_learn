import jwt from 'jsonwebtoken';

const auth = (request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
        console.log("token",token)
        if(!token) {
            return response.status(401).json({
                message : "Unauthorized",
                error : true,
                sucess : false
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded) {
            return response.status(401).json({
                message : "Unauthorized",
                error : true,
                sucess : false
            })
        }
        console.log("decoded",decoded)
        request.userId = decoded.id 
        next()

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            sucess : false
        })
        
    }
}
        
export default auth;