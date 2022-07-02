'use strict'

const express = require('express');
const api = express.Router();
const productController = require('../controllers/product.controller');
const midAuth = require('../services/auth');

api.get('/testProduct', [midAuth.ensureAuth, midAuth.isAdmin], productController.testProduct);

api.post('/addProduct', [midAuth.ensureAuth, midAuth.isAdmin], productController.addProduct);

api.get('/getProduct/:id', [midAuth.ensureAuth, midAuth.isAdmin], productController.getProduct);
api.get('/getProducts', midAuth.ensureAuth, productController.getProducts);

api.post('/searchProduct', midAuth.ensureAuth, productController.searchProduct);
api.post('/searchByCategory', midAuth.ensureAuth, productController.searchByCategory);
api.get('/outOfStockProducts', [midAuth.ensureAuth, midAuth.isAdmin], productController.outOfStockProducts);
api.get('/bestSellerProducts', midAuth.ensureAuth, productController.bestSellerProducts);

api.put('/updateProduct/:id', [midAuth.ensureAuth, midAuth.isAdmin], productController.updateProduct);

api.delete('/deleteProduct/:id', [midAuth.ensureAuth, midAuth.isAdmin], productController.deleteProduct);

module.exports = api;