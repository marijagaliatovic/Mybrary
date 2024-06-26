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
   renderNewPage(res, new Book())
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
        res.redirect(`books/${newBook.id}`)
    }catch{
        renderNewPage(res, book, true)
    }
})

//Show book route
router.get('/:id', async(req,res) => {
    try{
        const book = await Book.findById(req.params.id)
                                .populate('author') 
                                .exec() //we have to use populate function to "populate" selected value with all information, in our example in book collection author has only id, and with this we are able to get the name also (fetches all author info before fetching the book)
        //in case I deleted the author before puting constrains, book has author but it's not in the base, in that case don't throw error but return
        if(book.author == null){
            return
        }
        res.render('books/show', {book:book})
       
    }catch{
        res.redirect('/')
    }
})

//Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
    const book = await Book.findById(req.params.id)
      renderEditPage(res, book)
    } catch(err) {
        console.log(err)
      res.redirect('/')
    }
  })

 //Update book route
router.put('/:id', async(req, res)=>{
    let book 
    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author= req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover) // we don't want to delite the book cover if user doesn't change it
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch(error){
        console.log(error)
        if(book != null){
            renderNewPage(res, book, true)
        }
        else{
            redirect('/')
        }
    }
})

//Delete Book Page
router.delete('/:id', async (req,res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    }catch(err){
        console.log(err)
        if(book !=null ){
            res.render('books/show', {
                book:book,
                errorMessage: 'Could not remove book'
            })
        }else{
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({}) //fetches all authors
        const params = {
            authors:authors,
            book:book
        }
        if(hasError){
            if(form === "edit")
            {
                params.errorMessage = 'Error editing book!'
            }
            else{
                params.errorMessage = 'Error creating book!'
            }
        }
        res.render(`books/${form}`, params)
    }catch(err){
        console.log(err)
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
