/**
 * Test script to verify all models are properly registered with Mongoose
 */

const mongoose = require('mongoose');
const config = require('./configure');

// Use centralized model loader
const { verifyModels, forceRegisterModels, getModel } = require('./models/index');

async function testModels() {
    try {
        console.log('🔍 Testing Mongoose model registration...\n');
        
        // Connect to MongoDB
        await mongoose.connect(config.mongoUri.toString());
        console.log('✅ Connected to MongoDB');
        
        // Force register models first
        forceRegisterModels();
        
        // Verify all models are registered
        const allRegistered = verifyModels();
        
        if (!allRegistered) {
            console.log('❌ Some models are not registered, attempting to fix...');
            forceRegisterModels();
            verifyModels();
        }
        
        // Test if all models are accessible
        const models = ['Manufacturer', 'Product', 'Category', 'Authenticated'];
        
        for (const modelName of models) {
            try {
                const model = getModel(modelName);
                console.log(`✅ Model '${modelName}' is accessible`);
                
                // Test basic operations
                const count = await model.countDocuments();
                console.log(`   📊 ${modelName} collection has ${count} documents`);
                
            } catch (error) {
                console.log(`❌ Model '${modelName}' is NOT accessible:`, error.message);
            }
        }
        
        // Test populate operations
        console.log('\n🔍 Testing populate operations...');
        
        try {
            const Product = getModel('Product');
            const products = await Product.find().populate('manufacturer', 'name').limit(1);
            console.log('✅ Product -> Manufacturer populate works');
            if (products.length > 0) {
                console.log('   📝 Sample product:', products[0].name);
            }
        } catch (error) {
            console.log('❌ Product -> Manufacturer populate failed:', error.message);
        }
        
        try {
            const Category = getModel('Category');
            const categories = await Category.find().populate('manufacturer', 'name').limit(1);
            console.log('✅ Category -> Manufacturer populate works');
            if (categories.length > 0) {
                console.log('   📝 Sample category:', categories[0].name);
            }
        } catch (error) {
            console.log('❌ Category -> Manufacturer populate failed:', error.message);
        }
        
        try {
            const Authenticated = getModel('Authenticated');
            const auths = await Authenticated.find().populate('manufacturer', 'name').limit(1);
            console.log('✅ Authenticated -> Manufacturer populate works');
            if (auths.length > 0) {
                console.log('   📝 Sample auth:', auths[0].product);
            }
        } catch (error) {
            console.log('❌ Authenticated -> Manufacturer populate failed:', error.message);
        }
        
        console.log('\n🎉 Model registration test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testModels();