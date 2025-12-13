
const express = require('express');

const bodyparser = require('body-parser');

const mongoose = require('mongoose');

const conFig = require('./configure');

const app = express();

const cloudinary = require('cloudinary').v2;

const productRoutes = require('./routes/product');

const registerRoutes = require('./routes/register');

const loginRoutes = require('./routes/login');

app.use(bodyparser.json())

const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', "https://genuns.netlify.app", "https://genuns.netlify.app"],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'content-type', 'authorization');
    next();
})

// Configure Cloudinary with enhanced settings
try {
    cloudinary.config({
        cloud_name: conFig.cloud_name,
        api_key: conFig.apiKey,
        api_secret: conFig.apiSecret,
        secure: true,
        // Enhanced timeout and retry settings
        timeout: 120000, // 2 minutes timeout
        max_retries: 3,
        retry_delay: 1000 // 1 second delay between retries
    });
    console.log('Cloudinary configured successfully with enhanced settings');
} catch (cloudinaryError) {
    console.log('Cloudinary configuration error:', cloudinaryError);
    console.log('Continuing without Cloudinary...');
}

app.use("/api/register-user", registerRoutes);

app.use("/api/login", loginRoutes);

app.use("/api/products", productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        cloudinary: {
            configured: !!(conFig.cloud_name && conFig.apiKey && conFig.apiSecret)
        }
    });
});

// Cloudinary test endpoint
app.get('/api/cloudinary-test', async (req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.status(200).json({ 
            status: 'Cloudinary connection successful',
            result: result
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Cloudinary connection failed',
            error: error.message
        });
    }
});

app.use((error, req, res, next) => {
    console.log("Error:",error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message : message});
})

// Add global error handlers with better logging
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    
    // Handle Cloudinary specific errors
    if (reason && reason.error && reason.error.name === 'TimeoutError') {
        console.error('Cloudinary timeout detected in unhandled rejection');
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process for Cloudinary timeouts
    if (error.name !== 'TimeoutError') {
        process.exit(1);
    }
});

mongoose.connect(conFig.mongoUri.toString())
.then(result => {
    console.log("MongoDB connected successfully");
    
    // Load all models AFTER MongoDB connection is established
    const { loadModels } = require('./models/loader');
    loadModels();
    
    app.listen(3002, () => {
        console.log("Backend API successfully started on port 3002");
        console.log("All models verified and ready for operations");
    });
})
.catch(err => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
})



