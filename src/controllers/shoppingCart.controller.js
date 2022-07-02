'use strict'

const { validateData, findShoppingCart } = require('../utils/validate');
const ShoppingCart = require('../models/shoppingcart.model');
const Product = require('../models/product.model');

exports.testShoppingCart = (req, res) => {
    return res.send({ message: 'Mensaje de prueba desde el controlador del carrito de compras' })
}

exports.addToCart = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.sub;
        let data = {
            product: params.product,
            quantity: params.quantity
        }
        let msg = validateData(data);

        if (!msg) {
            const findProduct = await Product.findOne({ _id: data.product });
            if (!findProduct) {
                return res.status(400).send({ message: 'El producto no existe' });
            } else {
                if (data.quantity > findProduct.stock) {
                    return res.send({ message: 'No hay suficientes existencias del producto para la cantidad que ingresaste' })
                } else {
                    let checkShoppingCart = await findShoppingCart(userId);
                    if (!checkShoppingCart) {
                        data.user = userId;
                        data.subtotal = (findProduct.price * data.quantity);
                        data.total = (data.subtotal);
                        data.quantityProducts = 1;

                        let shoppingCart = new ShoppingCart(data)
                        await shoppingCart.save();

                        let shoppingCartId = await ShoppingCart.findOne({ user: userId })
                        let pushShoppingCart = await ShoppingCart.findOneAndUpdate({ _id: shoppingCartId._id }, { $push: { products: data } }, { new: true }).populate('products.product').lean();

                        return res.send({ message: 'Producto añadido al carrito', pushShoppingCart })
                    } else {
                        let shoppingCart = await ShoppingCart.findOne({ user: userId })
                        for (let product of shoppingCart.products) {
                            if (product.product != params.product) {
                                continue;
                            } else {
                                return res.send({ message: 'Ya tienes este producto en tu carrito' })
                            }
                        }
                        data.subtotal = (findProduct.price * data.quantity);
                        data.total = (data.subtotal + shoppingCart.total);
                        data.quantityProducts = shoppingCart.products.length + 1;

                        let pushShoppingCart = await ShoppingCart.findOneAndUpdate({ _id: shoppingCart._id }, { $push: { products: data }, total: data.total }, { new: true }).populate('products.product').lean();

                        if (!pushShoppingCart) {
                            return res.send({ message: 'No se ha podido agregar el producto al carrito' })
                        } else {
                            return res.send({ message: 'Producto añadido al carrito', pushShoppingCart })
                        }
                    }
                }
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error agregando producto al carrito' });
    }
}

exports.checkMyCart = async (req, res) => {
    try {
        const userId = req.user.sub;
        let shoppingCartPreview = await ShoppingCart.findOne({ user: userId }).populate('products.product').lean();
        if (shoppingCartPreview === null) {
            return res.send({ message: 'No tienes ningun producto en tú carrito' })
        } else {
            return res.send({ shoppingCartPreview });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.cleanMyCart = async (req, res) => {
    try {
        const userId = req.user.sub;
        let cleanShoppingCart = await ShoppingCart.findOneAndRemove({ user: userId }).lean();
        if (cleanShoppingCart === null) {
            return res.send({ message: 'No tienes ningun producto en tú carrito' })
        } else {
            return res.send({ message: 'Se han removido los productos de tu carrito' });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}