
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authenticatedSchema = new Schema({
    product: {
        type: String,
        required: true
    },

    requester: {
        type: String,
        required: true,
    },

    productId: {
        type: String,
        required: true

    },

    status: {
        type: String,
        required: true
    },

    manufacturer: {
        type: Schema.Types.ObjectId,
        ref: 'Manufacturer',
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('Authenticated', authenticatedSchema);