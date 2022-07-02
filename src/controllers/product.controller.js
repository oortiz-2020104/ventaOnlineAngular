'use strict'

const { validateData, findProduct, checkUpdateProducts } = require('../utils/validate');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

exports.testProduct = (req, res) => {
    return res.send({ message: 'Mensaje de prueba desde el controlador de producto' })
}

exports.addProduct = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name,
            description: params.description,
            brand: params.brand,
            price: params.price,
            stock: params.stock,
            sales: 0,
            category: params.category
        }
        let msg = validateData(data);

        if (!msg) {
            let checkCategory = await Category.findOne({ _id: params.category });
            if (!checkCategory) {
                return res.status(201).send({ message: 'La categoría ingresada no se ha podido encontrar' })
            } else {
                let product = new Product(data);
                await product.save();
                return res.send({ message: 'Producto guardado exitosamente' })
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error guardando el producto' });
    }
}

exports.getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId }).populate('category').lean();
        if (!product) {
            return res.status(404).send({ message: 'El producto ingresado no se ha podido encontrar' });
        } else {
            return res.send({ message: 'Producto encontrado: ', product });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el producto' });
    }
}

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category').lean();
        return res.send({ message: 'Productos encontrados', products });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo los productos' });
    }
}

exports.searchProduct = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name
        };
        const msg = validateData(data);
        if (!msg) {
            const product = await Product.find({ name: { $regex: params.name, $options: 'i' } }).populate('category').lean();
            return res.send(product);
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscado los productos' });
    }
}

exports.searchByCategory = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            category: params.category
        };
        const msg = validateData(data);
        if (!msg) {
            let checkCategory = await Category.findOne({ _id: params.category });
            if (!checkCategory) {
                return res.status(201).send({ message: 'La categoría ingresada no se ha podido encontrar' })
            } else {
                const findCategory = await Category.findOne({ _id: params.category }).lean();
                const findProductsByCategory = await Product.find({ category: findCategory._id }).populate('category').lean();
                return res.send({ findProductsByCategory })
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscando los productos' });
    }
}

exports.outOfStockProducts = async (req, res) => {
    try {
        const product = await Product.find({ stock: 0 }).populate('category').lean();
        return res.send(product);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscando los productos' });
    }
}

exports.bestSellerProducts = async (req, res) => {
    try {
        const product = await Product.find({}).sort({ sales: -1 }).populate('category').lean();
        return res.send(product);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscando los productos' });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const params = req.body;
        const productId = req.params.id;

        const checkUpdated = await checkUpdateProducts(params);
        if (checkUpdated === false) {
            return res.status(400).send({ message: 'Parámetros inválidos' })
        } else {
            let checkCategory = await Category.findOne({ _id: params.category });
            if (!checkCategory) {
                return res.status(201).send({ message: 'La categoría ingresada no se ha podido encontrar' })
            } else {
                const categoryExist = await Category.findOne({ _id: params.category });
                if (!categoryExist) {
                    return res.send({ message: 'Category not found' });
                } else {
                    const updateProduct = await Product.findOneAndUpdate({ _id: productId }, params, { new: true }).populate('category').lean();
                    if (!updateProduct) {
                        return res.send({ message: 'El producto no pudo ser actualizado' });
                    } else {
                        return res.send({ message: 'Producto actualizado exitosamente', updateProduct })
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el producto' });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const deleteProduct = await Product.findByIdAndDelete({ _id: productId }).lean();
        if (!deleteProduct) {
            return res.status(404).send({ message: 'Producto no encontrado o ya ha sido eliminado' })
        } else {
            return res.send({ message: 'Producto eliminado', deleteProduct })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el producto' });
    }
}