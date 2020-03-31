/*jshint esversion: 6 */
const express = require('express');
const Usuario = require('../models/usuario');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const app = express();
const _ = require('underscore');
const { VerificacionToken, VerificacionUSER_ROLE } = require('../middlewares/auth');


app.get('/usuario', VerificacionToken, VerificacionUSER_ROLE, function(req, res) {
    // console.log('req.usuario :', req.usuario);
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    Usuario.find({ estado: true }, 'nombre email estado google role').limit(limite).skip(desde)
        .exec((errors, usuarios) => {
            if (errors) {
                return res.status(400).json({
                    ok: false,
                    errors: errors.errors,
                });
            }
            Usuario.countDocuments({}, (eror, conteo) => {
                res.json({
                    cantidad: conteo,
                    ok: true,
                    longitud: usuarios.length,
                    usuarios: usuarios,
                });
            });
        });
});

app.post('/usuario', VerificacionToken, function(req, res) {
    // res.setHeader('Content-Type', 'text/plain');
    // res.write('you posted:\n');
    // res.end(JSON.stringify(req.body, null, 2));
    const user = req.body;
    let pswd_bcrypt = null;

    if (user.password != null && user.password != undefined && user.password != '')
        pswd_bcrypt = bcrypt.hashSync(user.password, saltRounds);
    let usuario = new Usuario({
        nombre: user.nombre,
        email: user.email,
        password: pswd_bcrypt,
        role: user.role
    });

    usuario.save((errors, usuarioDB) => {
        if (errors) {
            return res.status(400).json({
                ok: false,
                errors: errors.errors,
            });
        }
        res.json({
            persona: usuarioDB,
        });
    });

});

app.put('/usuario/:id', VerificacionToken, function(req, res) {
    // res.status(404).json('I dont have that');
    const body = _.pick(req.body, ['nombre', 'email', 'image', 'role', 'estado']);
    const id = req.params.id;
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (errors, usuarioDB) => {
        if (errors) {
            return res.status(400).json({
                ok: false,
                errors: errors,
            });
        }
        res.json({
            persona: usuarioDB,
        });
    });
});

app.delete('/usuario/:id', VerificacionToken, function(req, res) {
    const id = req.params.id;
    update = { estado: false };
    Usuario.findByIdAndUpdate(id, update, { new: true }, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                errors: err,
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                errors: 'Usuario no encontrado',
            });
        }
        res.json({
            ok: true,
            usuario: usuario,
        });

    });
});

module.exports = app;