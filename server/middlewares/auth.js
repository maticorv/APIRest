/*jshint esversion: 6 */
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');



// =======================
// Verificacion de Token
// =======================
const VerificacionToken = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        this.token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        this.token = req.query.token;
    } else {
        return res.status(401).json({
            "err": {
                "name": "JsonWebTokenError",
                "message": "Json no válido"
            }
        });
    }
    const cert = fs.readFileSync(path.join(__dirname, `../public.pem`), 'utf8'); // get public key
    jwt.verify(this.token, cert, { algorithms: ['RS256'] }, function(err, payload) {
        if (err) {
            return res.status(401).json({
                err
            });
        }
        req.usuario = payload.usuario;
        next();
    });
};

// =======================
// Verificacion de Token URL
// =======================
const VerificacionTokenURL = (req, res, next) => {
    const token = req.query.token;
    const cert = fs.readFileSync(path.join(__dirname, `../public.pem`), 'utf8'); // get public key
    jwt.verify(token, cert, { algorithms: ['RS256'] }, function(err, payload) {
        if (err) {
            return res.status(401).json({
                err
            });
        }
        req.usuario = payload.usuario;
        next();
    });
};


// =======================
// Verificacion de ROL
// =======================
const VerificacionUSER_ROLE = (req, res, next) => {
    if (req.usuario.role === 'USER_ROLE') {
        next();
    } else {
        return res.status(401).json({
            err: 'No estas autorizado'
        });

    }

};

// =======================
// Verificacion de ROL
// =======================
const VerificacionADMIN_ROLE = (req, res, next) => {
    if (req.usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            err: 'No estas autorizado'
        });

    }

};




module.exports = {
    VerificacionToken,
    VerificacionUSER_ROLE,
    VerificacionADMIN_ROLE,
    VerificacionTokenURL,
};