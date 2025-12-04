import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => {
    //get credentials
    const { userName, email, fullName, password } = req.body;

    //check the data validation
    if ([fullName, userName, email, password].some((field) => field?.trim() === ""
    )) {
        throw new ApiError(400, "All Fields are required");
    }

    //check if user already exist using userName and email
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existedUser) throw new ApiError(409, "user already exists");

    //check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

    //upload images to cloudinary, avatar is uploaded on multer and cloudinary or not
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "avatar file is required");

    //get url fromm stored image and-
    //-create user instance/object - create entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        userName: userName.toLowercase()
    })

    //remove password and refresh token field from res
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //check for user creation 
    if (!createdUser) throw new AppError(500, "something went wrong while registering a user")

    // return res : error
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
});


const loginUser = asyncHandler(async (req, res) => {
    //
});

export { registerUser, loginUser };