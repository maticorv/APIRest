var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var productoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'], unique: true, },
    precioUnitario: { type: Number, required: [true, 'El precio unitario es necesario'] },
    descripcion: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});
productoSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} tiene que ser unico.' });


module.exports = mongoose.model('Producto', productoSchema);