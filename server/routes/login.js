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
const { OAuth2Client } = require('google-auth-library');



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


// Configuracion de google
async function verify(token) {
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload.sub;
    const googleUser = {
        nombre: payload.given_name,
        apellido: payload.family_name,
        email: payload.email,
        imagen: payload.picture,
        google: true

    };
    return googleUser;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
}


app.post('/google', async(req, res) => {
    let idToken = req.body.idtoken;
    let googleUser = await verify(idToken).catch(e => {
        console.log(e);
        return res.status(403).json({
            error: e
        });
    });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google) {
                const key = fs.readFileSync(path.join(__dirname, `../private.key`), 'utf8');
                // const privateKey = fs.readFileSync(path);
                return res.status(200).json({
                    ok: true,
                    token: jwt.sign({
                        usuario: usuarioDB,
                        exp: Math.floor(Date.now() / 1000) + 2592000,
                    }, key, { algorithm: 'RS256' })
                });
            }
            return res.status(500).json({
                ok: false,
                err: 'Debe autenticarse con usuario y contraseña'
            });
        }
        // Si el usuario no existe en la base de datos
        let usuario = new Usuario({
            nombre: googleUser.nombre,
            email: googleUser.email,
            google: true,
            img: googleUser.imagen,
            role: 'USER_ROLE',
            password: bcrypt.hashSync(':D', saltRounds)
        });

        usuario.save((errors, usuarioDB) => {
            if (errors) {
                return res.status(400).json({
                    ok: false,
                    errors: errors.errors,
                });
            }
            return res.json({
                ok: true,
                token: jwt.sign({
                    usuario: usuarioDB,
                    exp: Math.floor(Date.now() / 1000) + 2592000,
                }, key, { algorithm: 'RS256' }),
            });
        });
    });
});

module.exports = app;