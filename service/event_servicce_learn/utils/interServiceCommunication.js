import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8080";
const USER_SERVICE_TIMEOUT_MS = Number(process.env.USER_SERVICE_TIMEOUT_MS || 5000);

export const extractAccessToken = (req) => {
    const tokenFromCookie = req?.cookies?.accessToken;
    if (tokenFromCookie) {
        return tokenFromCookie;
    }

    const authorization = req?.headers?.authorization || "";
    if (authorization.startsWith("Bearer ")) {
        return authorization.split(" ")[1];
    }

    return null;
};

export const verifyUserWithUserService = async (token) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/user/user-details`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: USER_SERVICE_TIMEOUT_MS,
            validateStatus: () => true
        });

        const payload = response.data;

        if (response.status >= 400 || payload?.error) {
            return {
                isVerified: false,
                statusCode: 401,
                message: payload?.message || "User verification failed"
            };
        }

        return {
           isVerified: true,
            user: payload?.data || null,
            message: payload?.message || "User verified"
        };
    } catch (error) {
        const isTimeout = error?.code === "ECONNABORTED";
        return {
            isVerified: false,
            statusCode: 503,
            message: isTimeout
                ? "User service timeout during verification"
                : "User service is unavailable"
        };
    }
};