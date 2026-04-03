import { extractAccessToken, verifyUserWithUserService } from "../utils/interServiceCommunication.js";

const verifyUser = async (req, res, next) => {
    try {
        const token = extractAccessToken(req);

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - token missing"
            });
        }

        const verification = await verifyUserWithUserService(token);

        if (!verification.isVerified) {
            return res.status(verification.statusCode || 401).json({
                message: verification.message || "Unauthorized"
            });
        }

        req.user = verification.user;
        next();
    } catch (error) {
        console.error("Verification middleware error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export default verifyUser;