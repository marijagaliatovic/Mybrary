const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//All Books Route

router.get('/', async (req, res) => {
    let query = Book.find() //explained in route author.js
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i')) //regex method is used to add a regular expression condition to the query, first argument is field that regExp is applied to, (case-insensitive regular expression search)
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore) //adds the restriction, that publishDate values have to be less or equal to req.query.publishedBefore, to the query that is later used to fetch the corresponding data
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter) //adds the restriction, that publishDate values have to be more or equal to req.query.publishedAfter, to the query that is later used to fetch the corresponding data
    }
    try{
        const books = await query.exec() //fetching data based on restrictions
        res.render('books/index', {
            books:books,
            searchOptions: req.query
       })
    }catch{
        res.redirect('/')
    }
})

//New Book Route
router.get('/new', async (req, res)=>{
   renderNewpage(res, new Book())
})

//create book route
router.post('/', async(req, res)=>{
    const book = new Book ({
        title:req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    try{
        const newBook = await book.save() //book is saved to db
        //res.redirect(`books/${newBook.id}`)
        res.redirect('books') //we are redirected to books page
    }catch(error){
        console.log(error)
        renderNewpage(res, book, true)
    }
})



async function renderNewpage(res, book, hasError = false){
    try{
        const authors = await Author.find({}) //fetches all authors
        const params = {
            authors:authors,
            book:book
        }
        if(hasError){
            params.errorMessage = 'Error creating book!'
        }
        res.render('books/new', params) 
    }catch{
        res.redirect('/books')
    }
}

//the imported image is encoded and we have to transfrom it from JSON format to JS object
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    /*For example, if coverEncoded contains a JSON string like {"data": "base64encodeddata", "type": "image/jpeg"},
     calling JSON.parse(coverEncoded) will return an JS object like { data: "base64encodeddata", type: "image/jpeg" }.*/
    const cover = JSON.parse(coverEncoded) //built in function 
    /*If the decoded object is not empty and the specified MIME type is allowed, 
    The base64 image data is assigned to the book.coverImage property
    We defined in book model that coverImage property has type of Buffer so we initialize new buffer with base64 cover.data (i think it's transformed to binary), 
    and the MIME type is assigned to the book.coverImageType property.*/
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }

module.exports = router
