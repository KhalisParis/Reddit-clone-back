const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    
    titre: {
        type: String,
        required: true
    },
    medias: {
        type: String,
        required: true
    },

    description : {
        type: String
    }
})

module.exports = mongoose.model('Post', postSchema);