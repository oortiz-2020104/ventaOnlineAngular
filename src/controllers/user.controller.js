'use strict';

const { validateData, findUser, checkPassword, checkUpdate, checkUpdate_OnlyAdmin, encrypt } = require('../utils/validate');
const User = require('../models/user.model');
const jwt = require('../services/jwt');

exports.test = (req, res) => {
    return res.send({ message: 'Mensaje de prueba' });
};

exports.login = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            username: params.username,
            password: params.password,
        };

        const msg = validateData(data);
        if (!msg) {
            let checkUser = await User.findOne({ username: params.username }).lean();
            let checkPass = await checkPassword(params.password, checkUser.password);
            delete checkUser.password;

            if (checkUser && checkPass) {
                const token = await jwt.createToken(checkUser);
                return res.send({ message: 'Iniciando sesión...', token, checkUser });
            } else {
                return res.status(201).send({ message: 'El usuario y/o contraseña incorrectas' });
            }
        } else {
            return res.status(404).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error al iniciar sesión' });
    }
};

exports.register = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: 'CLIENT'
        };

        const msg = validateData(data);
        if (!msg) {
            let checkUser = await findUser(data.username);
            if (!checkUser) {
                data.surname = params.surname;
                data.password = await encrypt(params.password);
                data.phone = params.phone;

                let user = new User(data);
                await user.save();
                return res.send({ message: 'Usuario guardado exitosamente', user });
            } else {
                return res.status(201).send({ message: 'Nombre de usuario ya esta en uso, utiliza uno diferente' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error al registrarse' });
    }
};

exports.register_OnlyAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: params.role
        };

        const msg = validateData(data);
        if (!msg) {
            const checkUser = await findUser(data.username);
            if (!checkUser) {
                if (params.role != 'ADMIN' && params.role != 'CLIENT') {
                    return res.send({ message: 'El rol no es válido' })
                } else {
                    data.surname = params.surname;
                    data.password = await encrypt(params.password);
                    data.phone = params.phone;

                    let user = new User(data);
                    await user.save();
                    return res.send({ message: 'Usuario guardado exitosamente', user });
                }
            } else {
                return res.send({ message: 'Nombre de usuario ya esta en uso, utiliza uno diferente' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error al registrarse' });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.send({ message: 'El usuario ingresado no se ha podido encontrar' })
        } else {
            return res.send(user);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo el usuario' });
    }
}

exports.getUsers = async (req, res) => {
    try {
        const user = await User.find();
        return res.send(user)
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo los usuarios' });
    }
}

exports.searchUser = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            username: params.username
        };

        const msg = validateData(data);
        if (!msg) {
            const user = await User.find({ username: { $regex: params.username, $options: 'i' } })
            return res.send(user)
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error buscando el usuario' });
    }
}

exports.update = async (req, res) => {
    try {
        const userId = req.user.sub;
        const params = req.body;

        const user = await User.findOne({ _id: userId })
        if (user) {
            const checkUpdated = await checkUpdate(params);
            if (checkUpdated === false) {
                return res.status(400).send({ message: 'Parámetros no válidos para actualizar' })
            } else {
                const checkRole = await User.findOne({ _id: userId })
                if (checkRole.role === 'ADMIN') {
                    return res.status(403).send({ message: 'No puedes editar tu usuario si tienes el rol ADMIN' });
                } else {
                    const checkUser = await findUser(params.username);
                    if (checkUser && user.username != params.username) {
                        return res.send({ message: 'Este nombre de usuario ya esta en uso' })
                    } else {
                        const updateUser = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
                        if (!updateUser) {
                            return res.send({ message: 'No se ha podido actualizar el usuario' })
                        } else {
                            return res.send({ message: 'Usuario actualizado', updateUser })
                        }
                    }
                }
            }
        } else {
            return res.send({ message: 'Este usuario no existe' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el usuario' });
    }
};

exports.update_OnlyAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const params = req.body;

        const user = await User.findOne({ _id: userId })
        if (user) {
            const checkUpdated = await checkUpdate_OnlyAdmin(params);
            if (checkUpdated === false) {
                return res.status(400).send({ message: 'Parámetros no válidos para actualizar' })
            } else {
                const checkRole = await User.findOne({ _id: userId })
                if (checkRole.role === 'ADMIN') {
                    return res.status(403).send({ message: 'No puede editar usuarios de rol ADMIN' });
                } else {
                    const checkUser = await findUser(params.username);
                    if (checkUser && user.username != params.username) {
                        return res.send({ message: 'Este nombre de usuario ya esta en uso' })
                    } else {
                        if (params.role != 'ADMIN' && params.role != 'CLIENT') {
                            return res.send({ message: 'El rol ingresado no es valido' })
                        } else {
                            const updateUser = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
                            if (!updateUser) {
                                return res.send({ message: 'No se ha podido actualizar el usuario' })
                            } else {
                                return res.send({ message: 'Usuario actualizado', updateUser })
                            }
                        }
                    }
                }
            }
        } else {
            return res.send({ message: 'Este usuario no existe' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el usuario' });
    }
};

exports.delete = async (req, res) => {
    try {
        const userId = req.user.sub;

        const checkRole = await User.findOne({ _id: userId })
        if (checkRole.role === 'ADMIN') {
            return res.status(403).send({ message: 'No puede eliminar usuarios de rol ADMIN' });
        } else {
            const deleteUser = await User.findOneAndDelete({ _id: userId });
            if (!deleteUser) {
                return res.status(500).send({ message: 'Usuario no encontrado' })
            } else {
                return res.send({ message: 'Cuenta eliminada' })
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el usuario' });
    }
};

exports.delete_OnlyAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.send({ message: 'Usuario no encontrado' })
        } else {
            if (user.role === 'ADMIN') {
                return res.status(403).send({ message: 'No puede eliminar usuarios de rol ADMIN' });
            } else {
                const deleteUser = await User.findOneAndDelete({ _id: userId });
                if (!deleteUser) {
                    return res.status(500).send({ message: 'Usuario no encontrado o ya ha sido eliminado' })
                } else {
                    return res.send({ message: 'Cuenta eliminada' })
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el usuario' });
    }
};