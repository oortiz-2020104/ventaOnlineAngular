'use strict'

const User = require('../models/user.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ShoppingCart = require('../models/shoppingcart.model');
const bcrypt = require('bcrypt-nodejs');

//* Usuarios ---------------------------------------------------------------------------------------

exports.validateData = (data) => {
    let keys = Object.keys(data),
        msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `El parámetro ${key} es obligatorio\n`
    }
    return msg.trim();
}

exports.findUser = async (username) => {
    try {
        let exist = User.findOne({ username: username }).lean();

        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (userId, sub) => {
    try {
        if (userId != sub) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (params) => {
    try {
        if (params.password || Object.entries(params).length === 0 || params.role) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdate_OnlyAdmin = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.password) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.encrypt = async (password) => {
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.deleteSensitiveData = async (data) => {
    try {
        delete data.user.password;
        delete data.user.role;
        delete data.animal.user;
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkSensitiveData = async (params) => {
    try {
        if (params.user || params.status) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

//* Categorías ---------------------------------------------------------------------------------------

exports.findCategory = async (category) => {
    try {
        let exist = Category.findOne({ name: category }).lean();
        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}

//* Productos ---------------------------------------------------------------------------------------

exports.findProduct = async (product) => {
    try {
        let exist = Product.findOne({ name: product }).lean();
        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdateProducts = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.sales) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

//* Carrito de compras ---------------------------------------------------------------------------------------

exports.findShoppingCart = async (shoppingCartUser) => {
    try {
        let exist = ShoppingCart.findOne({ user: shoppingCartUser }).lean();
        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}