const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate:{
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage:{
        type: Buffer,
        required: true
    },
    coverImageType:{
        type:String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId, //this is why we compare book.author with author.id
        required: true,
        ref:'Author'
    }

})

/*.virtual creates virtual property coverImagePath(it's not saved to db), this function uses other properties in db to construct new one. 
get function is applied and it recives function that generates Image path for retriving data from database, we use the path in view when rendering 
all images (chech out last div in views\books\index.ejs)*/
bookSchema.virtual('coverImagePath').get(function() { //not arrow functions so we can access "this" value
    //because we didn't save image in file system of server, but in db
    //we have to define URI for fetching that image from db 
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}` //with this we define uri used for fetching image from db
    }
  })

module.exports = mongoose.model('Book', bookSchema)