/*jshint esversion: 6 */
const express = require('express');
const fs = require('fs');
const Usuario = require('../models/usuario');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const _ = require('underscore');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();



app.post('/login', (req, res) => {
    caducidad = process.env.CADUCIDAD_TOKEN;
    let body = req.body;
    Usuario.findOne({ email: body.email }, (errors, usuarioDB) => {
        if (errors) {
            return res.status(400).json({
                ok: false,
                errors: errors,
            });
        }
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                errors: '(Usuario) o contraseña incorrectos',
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(404).json({
                ok: true,
                errors: 'Usuario o (contraseña) incorrectos',
            });
        } else {
            const key = fs.readFileSync(path.join(__dirname, `../private.key`), 'utf8');
            // const privateKey = fs.readFileSync(path);
            return res.status(200).json({
                ok: true,
                // token: jwt.sign({
                //     foo: 'bar',
                // }, 'shhhhh'),
                token: jwt.sign({
                    usuario: usuarioDB,
                    foo: 'bar',
                    exp: Math.floor(Date.now() / 1000) + 2592000,
                }, key, { algorithm: 'RS256' }),

            });
        }
    });
});




module.exports = app;