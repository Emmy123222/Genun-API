/**
 * Model Index - Centralized model loading and registration
 * This ensures all models are properly registered with Mongoose
 */

const mongoose = require('mongoose');

// Import all models to register them
const Manufacturer = require('./manufacturer');
const Product = require('./productSchema');
const Category = require('./category');
const Authenticated = require('./authenticated');

/**
 * Verify all models are registered
 */
const verifyModels = () => {
    const requiredModels = ['Manufacturer', 'Product', 'Category', 'Authenticated'];
    const registeredModels = mongoose.modelNames();
    
    console.log('🔍 Model Registration Verification:');
    
    let allRegistered = true;
    
    requiredModels.forEach(modelName => {
        if (registeredModels.includes(modelName)) {
            console.log(`✅ ${modelName} - Registered`);
        } else {
            console.error(`❌ ${modelName} - NOT Registered`);
            allRegistered = false;
        }
    });
    
    if (allRegistered) {
        console.log('🎉 All models successfully registered!');
    } else {
        console.error('⚠️ Some models are missing - this may cause populate errors');
    }
    
    return allRegistered;
};

/**
 * Force model registration
 */
const forceRegisterModels = () => {
    try {
        // Ensure all models are properly imported and available
        const models = [
            { name: 'Manufacturer', model: Manufacturer },
            { name: 'Product', model: Product },
            { name: 'Category', model: Category },
            { name: 'Authenticated', model: Authenticated }
        ];
        
        models.forEach(({ name, model }) => {
            if (model) {
                console.log(`✅ Model '${name}' is available`);
            } else {
                console.error(`❌ Model '${name}' is not available`);
            }
        });
        
        console.log('🔄 Models force-registered successfully');
        return true;
    } catch (error) {
        console.error('❌ Force registration failed:', error.message);
        return false;
    }
};

/**
 * Get a model safely with direct reference
 */
const getModel = (modelName) => {
    const models = {
        'Manufacturer': Manufacturer,
        'Product': Product,
        'Category': Category,
        'Authenticated': Authenticated
    };
    
    const model = models[modelName];
    if (!model) {
        throw new Error(`Model '${modelName}' not found. Available models: ${Object.keys(models).join(', ')}`);
    }
    
    console.log(`✅ Retrieved model '${modelName}' successfully`);
    return model;
};

module.exports = {
    Manufacturer,
    Product,
    Category,
    Authenticated,
    verifyModels,
    forceRegisterModels,
    getModel
};