import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import {ApiError} from "../utils/ApiResponse.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) throw new ApiError(401, "Unauthorized access");

        const decodedTokenInfo = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedTokenInfo?._id);
        if (!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid AccessToken")
    }
})