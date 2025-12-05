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
    if (!avatar) throw new ApiError(400, "Failed to upload avatar to Cloudinary");

    //get url fromm stored image and-
    //-create user instance/object - create entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        userName: userName.toLowerCase()
    })

    //remove password and refresh token field from res
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //check for user creation 
    if (!createdUser) throw new ApiError(500, "something went wrong while registering a user")

    // return res : error
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
});


const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
};


const loginUser = asyncHandler(async (req, res) => {
    //take credentials
    const { userName, email, password } = req.body;

    //validate them
    if (!userName && !email) throw new ApiError(400, "username or email is required.")

    //find user on the basis of userName or email 
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) throw new ApiError(404, "user doesn't exist");

    //check password
    const isPassCorrect = await user.isPasswordCorrect(password);

    //paswwor not wrong>
    if (!isPassCorrect) throw new ApiError(401, "enter correct password  ");

    //if password matches create accessToken and refreshToken
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);
    
    //send cookies//call to db if not expensive otherwise store the refreshToken to the user object fetched previously
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    //send response
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "user logged in successfully")
        )
});


const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: undefined,
        }
    },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    console

    return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
})

export { registerUser, loginUser, logoutUser };