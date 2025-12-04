import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
})


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //Now after uploading file successfully
        console("file is uploaded on cloudinary: ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//remove the locally saved temp files as the upload operation got failed
        return null;
    }
}


export {uploadOnCloudinary};