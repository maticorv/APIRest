/*jshint esversion: 6 */
require('../config.js');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const _ = require('underscore');
// import mongoose from 'mongoose';

const port = 8000;



const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(morgan('dev'));

// Configuracion global de rutas 
app.use('/api', require('./routes/index'));


mongoose.connect('mongodb+srv://matias:nAkkIpkaoRbBAN3y@cafe-1vggv.gcp.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).catch(error => {
    console.log('dberror :', error);
});


app.get('/api', function(req, res) {
    console.log('req :', req.headers.authorization);
    res.send('Bienvenido  a API Rest!');
});

app.listen(port, () => {
    console.log(colors.blue(`Aplicación corriendo en http://localhost: ${port}`));
});