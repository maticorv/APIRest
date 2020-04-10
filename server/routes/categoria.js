const express = require('express');
const Categoria = require('../models/categoria');
let { VerificacionToken, VerificacionADMIN_ROLE } = require('../middlewares/auth');


let app = express();

//==============================================
// Mostrar todas las categorias
//==============================================
app.get('/categoria', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre')
        .exec(
            function(err, CategoriaDB) {
                if (err) {
                    return res.status(404).json({
                        err: err
                    });
                }
                return res.json({
                    categorias: CategoriaDB
                });

            }
        );
});
//==============================================
// Mostrar una categoria por ID
//==============================================
app.get('/categoria/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    id = req.params.id;
    Categoria.findById(id, function(err, CategoriaDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            categoria: CategoriaDB
        });
    });
});
//==============================================
// Agregar una categoria
//==============================================
app.post('/categoria', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const body = req.body;
    usuario = req.usuario;
    categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario._id
    });
    categoria.save(function(err, CategoriaDB) {
        if (err) {
            return res.status(500).json({
                err: err
            });
        }
        if (!CategoriaDB) {
            return res.status(400).json({
                err: err
            });
        }
        return res.json({
            categoria: CategoriaDB
        });
    });
});
//==============================================
// Borrar una categoria
//==============================================
app.delete('/categoria/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const id = req.params.id;
    Categoria.findByIdAndDelete(id, function(err, CategoriaDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            categoria: CategoriaDB
        });
    });

});
//==============================================
// Actualizar una categoria
//==============================================
app.put('/categoria/:id', VerificacionToken, VerificacionADMIN_ROLE, function(req, res) {
    const id = req.params.id;
    const categoria = req.body;
    Categoria.findByIdAndUpdate(id, categoria, { new: true }, function(err, CategoriaDB) {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        return res.json({
            categoria: CategoriaDB
        });
    });
});


module.exports = app;