'use strict';
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: String,
    description: String
})

module.exports = mongoose.model('Category', categorySchema);