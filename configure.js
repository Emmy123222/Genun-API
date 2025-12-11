require('dotenv').config();

module.exports = {
    mongoUri: process.env.MONGO_URI,
    hostMailAddress: process.env.HOST_ADDRESS,
    hostPass: process.env.HOST_PASSWORD,
    jwtKey : process.env.POos_jwtPrivateKey,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET

};

