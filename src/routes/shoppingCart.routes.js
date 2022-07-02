'use strict'

const express = require('express');
const api = express.Router();
const shoppingCartController = require('../controllers/shoppingCart.controller');
const midAuth = require('../services/auth');

api.get('/testShoppingCart', [midAuth.ensureAuth, midAuth.isAdmin], shoppingCartController.testShoppingCart)

api.post('/addToCart', midAuth.ensureAuth, shoppingCartController.addToCart)

api.get('/checkMyCart', midAuth.ensureAuth, shoppingCartController.checkMyCart)

api.get('/cleanMyCart', midAuth.ensureAuth, shoppingCartController.cleanMyCart)

module.exports = api;