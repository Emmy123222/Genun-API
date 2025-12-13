/**
 * Startup Check Script
 * Verifies that all models and configurations are working before starting the server
 */

const mongoose = require('mongoose');
const config = require('./configure');

// Import centralized model loader
const { verifyModels, forceRegisterModels, getModel } = require('./models/index');

async function runStartupCheck() {
    console.log('🚀 Running startup checks...\n');
    
    let allChecksPass = true;
    
    try {
        // 1. Check MongoDB connection
        console.log('1️⃣ Testing MongoDB connection...');
        await mongoose.connect(config.mongoUri.toString());
        console.log('✅ MongoDB connection successful\n');
        
        // 2. Force register all models
        console.log('2️⃣ Registering models...');
        forceRegisterModels();
        
        // 3. Verify model registration
        console.log('3️⃣ Verifying model registration...');
        const modelsRegistered = verifyModels();
        if (!modelsRegistered) {
            allChecksPass = false;
        }
        console.log('');
        
        // 4. Test model access
        console.log('4️⃣ Testing model access...');
        const models = ['Manufacturer', 'Product', 'Category', 'Authenticated'];
        
        for (const modelName of models) {
            try {
                const model = getModel(modelName);
                const count = await model.countDocuments();
                console.log(`✅ ${modelName}: ${count} documents`);
            } catch (error) {
                console.log(`❌ ${modelName}: ${error.message}`);
                allChecksPass = false;
            }
        }
        console.log('');
        
        // 5. Test populate operations
        console.log('5️⃣ Testing populate operations...');
        
        try {
            const Product = getModel('Product');
            await Product.findOne().populate('manufacturer', 'name');
            console.log('✅ Product populate test passed');
        } catch (error) {
            console.log('❌ Product populate test failed:', error.message);
            allChecksPass = false;
        }
        
        try {
            const Category = getModel('Category');
            await Category.findOne().populate('manufacturer', 'name');
            console.log('✅ Category populate test passed');
        } catch (error) {
            console.log('❌ Category populate test failed:', error.message);
            allChecksPass = false;
        }
        
        try {
            const Authenticated = getModel('Authenticated');
            await Authenticated.findOne().populate('manufacturer', 'name');
            console.log('✅ Authenticated populate test passed');
        } catch (error) {
            console.log('❌ Authenticated populate test failed:', error.message);
            allChecksPass = false;
        }
        
        console.log('');
        
        // 6. Configuration check
        console.log('6️⃣ Checking configuration...');
        
        if (config.mongoUri) {
            console.log('✅ MongoDB URI configured');
        } else {
            console.log('❌ MongoDB URI not configured');
            allChecksPass = false;
        }
        
        if (config.jwtKey) {
            console.log('✅ JWT key configured');
        } else {
            console.log('❌ JWT key not configured');
            allChecksPass = false;
        }
        
        console.log('');
        
        // Final result
        if (allChecksPass) {
            console.log('🎉 All startup checks passed! Server is ready to start.');
            process.exit(0);
        } else {
            console.log('❌ Some startup checks failed. Please fix the issues before starting the server.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Startup check failed with error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the startup check
runStartupCheck();