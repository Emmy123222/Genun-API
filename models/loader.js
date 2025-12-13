/**
 * Model Loader - Handles model loading with proper MongoDB connection state management
 */

const mongoose = require('mongoose');

let modelsLoaded = false;
let models = {};
let loadPromise = null;

/**
 * Load all models after MongoDB connection is established
 */
const loadModels = async () => {
    // If models are already loaded, return them immediately
    if (modelsLoaded) {
        console.log('📦 Models already loaded, skipping...');
        return models;
    }

    // If models are currently being loaded, return the existing promise
    if (loadPromise) {
        return loadPromise;
    }

    // Create a new promise to handle the loading
    loadPromise = (async () => {
        console.log('🔍 Checking MongoDB connection status...');
        
        // If not connected, wait for connection
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for MongoDB connection...');
            await new Promise((resolve) => {
                const checkConnection = () => {
                    if (mongoose.connection.readyState === 1) {
                        console.log('✅ MongoDB connection verified');
                        resolve();
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }

        console.log('📦 Loading Mongoose models...');

        try {
            // Import and register all models
            models.Manufacturers = require('./manufacturer');
            models.Product = require('./productSchema');
            models.Category = require('./category');
            models.Authenticated = require('./authenticated');

            // Verify models are registered
            const registeredModels = mongoose.modelNames();
            console.log('📋 Registered models:', registeredModels);

            const requiredModels = ['Manufacturers', 'Product', 'Category', 'Authenticated'];
            const allRegistered = requiredModels.every(modelName => {
                const isRegistered = registeredModels.includes(modelName);
                console.log(`${isRegistered ? '✅' : '❌'} ${modelName} - ${isRegistered ? 'Registered' : 'NOT Registered'}`);
                return isRegistered;
            });

            if (allRegistered) {
                modelsLoaded = true;
                console.log('🎉 All models loaded successfully!');
                return models;
            } else {
                throw new Error('Some models failed to register');
            }
        } catch (error) {
            console.error('💥 Failed to load models:', error);
            modelsLoaded = false;
            loadPromise = null;
            throw error;
        }
    })();

    return loadPromise;
};

/**
 * Get a specific model, loading models if necessary
 */
const getModel = async (modelName) => {
    // If models aren't loaded yet, load them first
    if (!modelsLoaded) {
        try {
            await loadModels();
        } catch (error) {
            console.error(`Error loading models: ${error.message}`);
            throw new Error(`Failed to load models: ${error.message}`);
        }
    }

    // Check if the requested model exists
    if (!models[modelName]) {
        throw new Error(`Model '${modelName}' not found. Available models: ${Object.keys(models).join(', ')}`);
    }

    return models[modelName];
};

/**
 * Get all models, loading them if necessary
 */
const getAllModels = async () => {
    if (!modelsLoaded) {
        await loadModels();
    }
    return models;
};

/**
 * Check if models are loaded
 */
const areModelsLoaded = () => {
    return modelsLoaded;
};

module.exports = {
    loadModels,
    getModel,
    getAllModels,
    areModelsLoaded
};