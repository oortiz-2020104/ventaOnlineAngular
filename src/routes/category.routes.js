'use strict'

const express = require('express')
const api = express.Router();
const categoryController = require('../controllers/category.controller');
const midAuth = require('../services/auth');

api.get('/testCategory', [midAuth.ensureAuth, midAuth.isAdmin], categoryController.testCategory);

api.post('/addCategory', [midAuth.ensureAuth, midAuth.isAdmin], categoryController.addCategory)

api.put('/updateCategory/:id', [midAuth.ensureAuth, midAuth.isAdmin], categoryController.updateCategory)

api.get('/getCategory/:id', [midAuth.ensureAuth, midAuth.isAdmin], midAuth.ensureAuth, categoryController.getCategory);
api.get('/getCategories', midAuth.ensureAuth, categoryController.getCategories);
api.post('/searchCategory', midAuth.ensureAuth, categoryController.searchCategory);

api.delete('/deleteCategory/:id', [midAuth.ensureAuth, midAuth.isAdmin], categoryController.deleteCategory)

module.exports = api;