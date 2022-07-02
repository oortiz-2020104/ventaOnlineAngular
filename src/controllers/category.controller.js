'use strict'

const { validateData, findCategory, checkUpdate } = require('../utils/validate');
const Category = require('../models/category.model');
const Product = require('../models/product.model');

exports.testCategory = (req, res) => {
    return res.send({ message: 'Mensaje de prueba desde el controlador de categorías' })
}

exports.addCategory = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description
        }
        let msg = validateData(data);
        if (!msg) {
            let checkCategory = await findCategory(data.name);
            if (!checkCategory) {
                let category = new Category(data);
                await category.save();
                return res.send({ message: 'Categoría guardada exitosamente', category });
            } else {
                return res.status(201).send({ message: 'Ya existe una categoría igual' })
            }
        } else {
            return res.status(400).send(msg)
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error agregando categoría' })
    }
}

exports.getCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findOne({ _id: categoryId });
        if (!category) {
            return res.send({ message: 'La categoría ingresada no se ha podido encontrar' })
        } else {
            return res.send(category);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error obteniendo la categoría' })
    }
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.send({ message: 'Categorías encontradas', categories})
    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error obteniendo las categorías' })
    }
}

exports.searchCategory = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name
        };
        const msg = validateData(data);
        if (!msg) {
            const category = await Category.find({ name: { $regex: params.name, $options: 'i' } })
            return res.send(category)
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error buscando las categorías' })
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const params = req.body;
        const categoryId = req.params.id;

        const checkUpdated = await checkUpdate(params);
        if (checkUpdated === false) {
            return res.status(400).send({ message: 'No se han recibido parámetros' })
        } else {
            const category = await Category.findOne({ _id: categoryId })
            if (category) {
                if (category.name === 'Default') {
                    return res.send({ message: 'No puede actualizar la categoría Default' })
                } else {
                    const checkCategory = await Category.findOne({ name: params.name });
                    if (checkCategory && category.name != params.name) {
                        return res.send({ message: 'Ya existe una categoría llamada igual' })
                    } else {
                        const updateCategory = await Category.findOneAndUpdate({ _id: categoryId }, params, { new: true });
                        if (!updateCategory) {
                            return res.send({ message: 'No se ha podido actualizar la categoría' })
                        } else {
                            return res.send({ message: 'Categoría actualizada', updateCategory })
                        }
                    }
                }
            } else {
                return res.send({ message: 'Esta categoría no existe' })
            }
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error actualizando la categoría' })
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;


        let checkCategory = await Category.findOne({ _id: categoryId });
        if (checkCategory) {
            const findDefault = await Category.findOne({ name: 'Default' })
            if (findDefault.id === categoryId) {
                return res.send({ message: 'No puede eliminar la categoría Default' })
            } else {
                const deleteCategory = await Category.findOneAndDelete({ _id: categoryId });
                const updateProduct = await Product.updateMany({ category: categoryId }, { category: findDefault.id }, { new: true })
                if (!deleteCategory) {
                    return res.status(404).send({ message: 'Categoría no encontrada o ya ha sido eliminada' })
                } else {
                    return res.send({ message: 'Categoría eliminada y se actualizaron los siguientes productos:', updateProduct })
                }
            }
        } else {
            return res.status(201).send({ message: 'La categoría no existe' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err, { message: 'Error eliminando la categoría' })
    }
}