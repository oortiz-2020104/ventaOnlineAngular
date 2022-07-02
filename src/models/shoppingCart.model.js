'use strict';
const mongoose = require('mongoose');

const shoppingCartSchema = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User'},
    products: [{
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        quantity: Number,
        subtotal: Number
    }],
    quantityProducts: Number,
    total: Number
})

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);