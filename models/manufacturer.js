const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        maxLength: 1024,
    },
    industry: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    contractAddress: {
        type: String,
        required: false,
    },
    isFirstTimeLogin: {
        type: Boolean,
        default: true,
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
    idNumber: {
        type: String,
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model('Manufacturers', ManufacturerSchema);
