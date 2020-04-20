const express = require('express');
const { VerificacionToken, VerificacionADMIN_ROLE } = require('../middlewares/auth');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const redis = require('redis');
const client = redis.createClient();
const fs = require('file-system');
const path = require('path');

let app = express();

// para subir archivos al servidor
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


app.post('/upload/:tipo/:id', VerificacionToken, function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    constTiposValidos = ['productos', 'usuarios'];
    const tipo = req.params.tipo;
    const id = req.params.id;

    if (!constTiposValidos.includes(tipo)) {
        return res.status(404).json({
            ok: false,
            err: 'Formato de archivo no valido las extensiones válidas son: ' + constTiposValidos
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    const extension = sampleFile.name.split('.')[sampleFile.name.split('.').length - 1];
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (!extensionesValidas.includes(extension)) {
        return res.status(404).json({
            ok: false,
            err: 'Formato de archivo no valido las extensiones válidas son: ' + extensionesValidas
        });
    }
    // Cambiar nombre al archivo
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    switch (tipo) {
        case 'usuarios':
            imagenUsuario(req.usuario._id, nombreArchivo, sampleFile, tipo, res);
            break;
        case 'productos':
            imagenProducto(id, nombreArchivo, sampleFile, tipo, res);
            break;
        default:
            break;
    }
});


function imagenUsuario(id, nombreArchivo, sampleFile, tipo, res) {
    let pathIMAGEN = '';
    Usuario.findByIdAndUpdate(id, { img: nombreArchivo }, { useFindAndModify: false }, (err, UsuarioDB) => {
                if (err) {
                    return res.json({
                        err: err
                    });
                }
                if (!UsuarioDB) {
                    return res.status(404).json({
                        err: "No se encuentra el usuario en la bse de datos"
                    });
                }

                pathIMAGEN = path.resolve(__dirname, `../uploads/usuarios/${UsuarioDB[`img`]}`);
        BorrarArchivo(pathIMAGEN);

        sampleFile.mv(path.join(__dirname, `../uploads/${tipo}/${nombreArchivo}`), function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.send(`Archivo ${sampleFile.name} se ha subido correctamente`);
        });
    });

}

function imagenProducto(id, nombreArchivo, sampleFile, tipo, res) {
    let pathIMAGEN = '';
    Producto.findByIdAndUpdate(id, { img: nombreArchivo }, { useFindAndModify: false }, (err, ProductoDB) => {
                if (err) {
                    return res.json({
                        err: err
                    });
                }
                if (!ProductoDB) {
                    return res.status(404).json({
                        err: "No se encuentra el producto en la base de datos"
                    });
                }

                pathIMAGEN = path.resolve(__dirname, `../uploads/productos/${ProductoDB[`img`]}`);
        BorrarArchivo(pathIMAGEN);

        sampleFile.mv(path.join(__dirname, `../uploads/${tipo}/${nombreArchivo}`), function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            return res.send(`Archivo ${sampleFile.name} se ha subido correctamente`);
        });
    });

}

function BorrarArchivo(pathIMAGEN) {
    if (fs.existsSync(pathIMAGEN)) {
        fs.unlinkSync(pathIMAGEN);
    }
}

module.exports = app;