const mongoose = require('mongoose')
const Book = require('./book')

//in MongoDb we will have collection of authors 
//schema represents the structure of doucments within a collection in MongoDB
//Each author document should have a name field type of string and it's required
const authorSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true //predefined property
    }
})

//mongoose has a way to run certain code before, during or after an action 
//this code runs before we remove the author
authorSchema.pre('deleteOne',{ document: true, query: false }, async function(next) {
    authorId = this._id
    try{
        const  books = await Book.find({ author: authorId })
        if (books.length > 0) {
            next(new Error('This author has books still'))
        }
        else{
            next();
        }
    }
    catch(err){
        next(err)
    }
})

module.exports = mongoose.model('Author', authorSchema) //creating model named Author based on authorSchema