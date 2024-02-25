const mongoose = require('mongoose')

//in MongoDb we will have collection of authors 
//schema represents the structure of doucments within a collection in MongoDB
//Each author document should have a name field type of string and it's required
const authorSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true //predefined property
    }
})

module.exports = mongoose.model('Author', authorSchema) //creating model named Author based on authorSchema