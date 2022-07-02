'use strict'

const express = require('express');
const api = express.Router();
const userController = require('../controllers/user.controller');
const midAuth = require('../services/auth');

//*ADMIN
api.get('/test', userController.test);
api.post('/register_OnlyAdmin', [midAuth.ensureAuth, midAuth.isAdmin], userController.register_OnlyAdmin);
api.get('/getUser/:id',[midAuth.ensureAuth, midAuth.isAdmin], userController.getUser);
api.get('/getUsers',[midAuth.ensureAuth, midAuth.isAdmin], userController.getUsers);
api.post('/searchUser', [midAuth.ensureAuth, midAuth.isAdmin], userController.searchUser);
api.put('/update_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], userController.update_OnlyAdmin );
api.delete('/delete_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], userController.delete_OnlyAdmin);

//*ALL ROLES
api.post('/login', userController.login);
api.post('/register', userController.register);
api.put('/update', midAuth.ensureAuth, userController.update);
api.delete('/delete', midAuth.ensureAuth, userController.delete);

module.exports = api;