/**
 * Test script to verify product verification functionality
 * This tests the specific getProduct function that's failing
 */

const mongoose = require('mongoose');
const config = require('./configure');

// Import all models directly
const Manufacturer = require('./models/manufacturer');
const Product = require('./models/productSchema');
const Category = require('./models/category');
const Authenticated = require('./models/authenticated');

async function testProductVerification() {
    try {
        console.log('🧪 Testing product verification functionality...\n');
        
        // Connect to MongoDB
        await mongoose.connect(config.mongoUri.toString());
        console.log('✅ Connected to MongoDB');
        
        // Verify models are registered
        const registeredModels = mongoose.modelNames();
        console.log('📋 Registered models:', registeredModels);
        
        const requiredModels = ['Manufacturer', 'Product', 'Category', 'Authenticated'];
        requiredModels.forEach(modelName => {
            if (registeredModels.includes(modelName)) {
                console.log(`✅ ${modelName} - Registered`);
            } else {
                console.log(`❌ ${modelName} - NOT Registered`);
            }
        });
        
        // Test basic model operations
        console.log('\n🔍 Testing model operations...');
        
        // Test Manufacturer model
        try {
            const manufacturerCount = await Manufacturer.countDocuments();
            console.log(`✅ Manufacturer model works - ${manufacturerCount} documents`);
        } catch (error) {
            console.log(`❌ Manufacturer model failed:`, error.message);
        }
        
        // Test Product model
        try {
            const productCount = await Product.countDocuments();
            console.log(`✅ Product model works - ${productCount} documents`);
        } catch (error) {
            console.log(`❌ Product model failed:`, error.message);
        }
        
        // Test populate operation (this is what's failing)
        console.log('\n🔗 Testing populate operations...');
        
        try {
            const products = await Product.find().populate({
                path: 'manufacturer',
                select: 'name contractAddress'
            }).limit(1);
            
            console.log(`✅ Product populate works - found ${products.length} products`);
            if (products.length > 0) {
                console.log(`   📝 Sample product: ${products[0].name}`);
                console.log(`   👤 Manufacturer: ${products[0].manufacturer?.name || 'Not populated'}`);
            }
        } catch (error) {
            console.log(`❌ Product populate failed:`, error.message);
        }
        
        // Test specific product lookup (simulating the failing operation)
        console.log('\n🎯 Testing specific product lookup...');
        
        try {
            const sampleProduct = await Product.findOne().select('productId');
            if (sampleProduct) {
                console.log(`🔍 Testing with product ID: ${sampleProduct.productId}`);
                
                const product = await Product.findOne({ 
                    productId: sampleProduct.productId 
                }).populate({
                    path: 'manufacturer',
                    select: 'name contractAddress'
                });
                
                if (product) {
                    console.log(`✅ Product lookup successful: ${product.name}`);
                    console.log(`   👤 Manufacturer: ${product.manufacturer?.name || 'Not found'}`);
                } else {
                    console.log(`❌ Product not found with ID: ${sampleProduct.productId}`);
                }
            } else {
                console.log(`ℹ️ No products found in database for testing`);
            }
        } catch (error) {
            console.log(`❌ Specific product lookup failed:`, error.message);
        }
        
        console.log('\n🎉 Product verification test completed!');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testProductVerification();