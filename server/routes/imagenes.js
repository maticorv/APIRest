const express = require('express');
const fs = require('file-system');
const path = require('path');
let { VerificacionToken, VerificacionUSER_ROLE, VerificacionTokenURL } = require('../middlewares/auth');

const app = express();
tiposValidos = ['productos', 'usuarios'];
app.get('/imagen/:tipo/:img', VerificacionTokenURL, VerificacionUSER_ROLE, (req, res) => {
    const tipo = req.params.tipo;
    if (!tiposValidos.includes(tipo)) {
        return res.status(401).json({
            ok: false,
            err: 'El tipo no es valido, ' + tiposValidos,
        });
    }
    const img = req.params.img;
    const pathIMAGEN = path.resolve(__dirname, `../uploads/${tipo}/${img}.png`);
    const noImage = path.resolve(__dirname, '../assets/original.jpg');
    if (fs.existsSync(pathIMAGEN)) {
        return res.sendFile(pathIMAGEN);
    } else {
        return res.sendFile(noImage);
    }

});




module.exports = app;