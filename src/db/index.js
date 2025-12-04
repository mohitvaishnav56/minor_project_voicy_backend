import { DB_NAME } from "../constant.js";
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionHost = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB connected successfully to DB Host: ", connectionHost.connection.host);
    } catch (err) {
        console.error("error: ", err);
        process.exit(1);
    }
}

export default connectDB; 