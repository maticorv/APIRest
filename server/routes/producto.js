const express = require('express');
const Producto = require('../models/producto');
let { VerificacionToken, VerificacionADMIN_ROLE } = require('../middlewares/auth');

let app = express();

//==============================================
// Mostrar todas las productos
//==============================================
app.get('/producto', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    let query = {};
    if (req.body.nombre) {
        query.nombre = req.body.nombre;
    }
    if (req.body.precioUnitario) {
        console.log('entyro :');
        query.precioUnitario = req.body.precioUnitario;
    }
    if (req.body.descripcion) {
        query.descripcion = req.body.descripcion;
    }
    if (req.body.disponible) {
        query.disponible = req.body.disponible;
    }
    if (req.body.categoria) {
        query.categoria = req.body.categoria;
    }
    if (req.body.usuario) {
        query.usuario = req.body.usuario;
    }
    console.log('query :', query);
    Producto.find(query)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec(
            function(err, ProductoDB) {
                if (err) {
                    return res.status(404).json({
                        err,
                    });
                }
                return res.json({
                    productos: ProductoDB
                });

            }
        );
});
// ===========================
//  Buscar productos
// ===========================
app.get('/productos/buscar/:termino', VerificacionToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto
        .find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                productos
            });
        });
});
//==============================================
// Mostrar una producto por ID
//==============================================
app.get('/producto/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    id = req.params.id;
    Producto.findById(id, function(err, ProductoDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            producto: ProductoDB
        });
    });
});
//==============================================
// Agregar una producto
//==============================================
app.post('/producto', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const body = req.body;
    usuario = req.usuario;
    producto = new Producto({
        nombre: body.nombre,
        precioUnitario: body.precioUnitario,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuario._id,
    });
    producto.save(function(err, ProductoDB) {
        if (err) {
            return res.status(441).json({
                err: err
            });
        }
        if (!ProductoDB) {
            return res.status(400).json({
                err: err
            });
        }
        return res.json({
            producto: ProductoDB
        });
    });
});
//==============================================
// Borrar una producto
//==============================================
app.delete('/producto/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const id = req.params.id;
    producto = {
        disponible: false
    };
    Producto.findByIdAndUpdate(id, producto, { new: true }, function(err, ProductoDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            producto: ProductoDB
        });
    });

});
//==============================================
// Actualizar una producto
//==============================================
app.put('/producto/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const id = req.params.id;
    const producto = req.body;
    Producto.findByIdAndUpdate(id, producto, { new: true }, function(err, ProductoDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            producto: ProductoDB
        });
    });
});


































module.exports = app;