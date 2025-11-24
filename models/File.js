const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'link' // 'file' (base64) ou 'link' (url externa)
    },
    content: {
        type: String,
        required: true // Aqui fica o Base64 do arquivo ou o Link
    },
    size: {
        type: String,
        default: '-'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', FileSchema);