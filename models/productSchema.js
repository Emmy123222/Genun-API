const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        
    },
    description: {
        type: String,
        required: true,
    },
    nafdacId: {
        type: String,
        required: true,
    
    },
    quantity: {
        type: Number,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
    barcode: {
        type: String,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    manufacturer: {
        type: Schema.Types.ObjectId,
        ref: 'Manufacturer',
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
    }
}, { timestamps: true});

module.exports = mongoose.model('Product', ProductSchema);
