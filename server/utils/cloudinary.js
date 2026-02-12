import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath || typeof localFilePath !== "string") {
            console.error("Invalid file path provided.");
            return null;
        }

        // Configure Cloudinary inline with explicit values
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "droipeaku",
            api_key: process.env.CLOUDINARY_API_KEY || "762412656729872",
            api_secret: process.env.CLOUDINARY_API_SECRET || "gRRdvyAvjmcRfLustAcfcHCpkR8",
        });

        // Debug log
        console.log('Uploading to Cloudinary with config:', {
            cloud_name: cloudinary.config().cloud_name,
            api_key: cloudinary.config().api_key ? 'SET' : 'NOT SET',
            api_secret: cloudinary.config().api_secret ? 'SET' : 'NOT SET'
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded successfully to Cloudinary:", response.secure_url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log("Temporary file deleted locally.");
            }
        } catch (unlinkError) {
            console.error("Error removing local file:", unlinkError);
        }

        return null;
    }
};

export { uploadOnCloudinary };
