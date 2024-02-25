const express = require('express')
const router = express.Router() //.Router() returns new router object
const Author = require('../models/author')

//We created model Author that interacts with collection of authors in MongoDB
//If we want to fetch data from DB we use Author
//Author.find(searchOptions) returns a query object that can be used to retrive documents from DB from authord collection
//we define searchOptions based on user input
//searchOptions is appended with name value that contains new regular expression that will filter the authors by the inputed value
//it filters the data based on the substring enterd by user, 'i' is condtion that ensures that the data is not case sensitive
//in try section every author that has same values that are defined in the searchOptions iis fetched from database with this line  const authors = await Author.find(searchOptions)
//const authors = await Author.find(searchOptions) -> .find(searchOptions) filter the data, if we use await it becomes asyncronus and it exectues the query -> the data is fetched
//if we just use Author.find(searchOptions) without await then that line returns query object on which additional filter can be applied, example in books.js, 
//to fetch the data in that case we use query.exec()
// router object has several methods some of them are .get, .post, .put...they take 2 arguments, first argument is the path and the second one is callback function
//the callback is often in the form of (req,res) => {code}

//All Authors Route, route for get http request 
router.get('/', async (req, res) => {
    let searchOptions = {}  
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions) //since we are using await for promise resolving the function where await is used has to be async
        //render is method that takes 2 arguments
        //first argument is path to the view that will be rendered if there is no error (view directory has already defined path in server.js, authors/index is inside of views dir)
        //second argument is data object that we need to pass to the view 
        res.render('authors/index', {
            authors:authors, //list of authors fetched from database based on searchOptions
            searchOptions:req.query //value that user inputed to searchBar, passing that value so that it could be shown inside of the search bar after the user presses Search, (last search)
        })
    }catch{
        res.redirect('/') //if there is error response redirects the page
    }
})


//New Author Route
//route handler is invoked when new GET request is made to '/new' endpoint
router.get('/new', (req, res)=>{
    res.render('authors/new', {author: new Author()}) //this works without second parametar, but it's goood practise to sent it
})


//create Author route
//this is called after the form with new author is submitted
//since POST metode is used the
router.post('/', async(req, res)=>{
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save() //saving the new data to db
         //res.redirect(`authors/${newAuthor.id}`)
         res.redirect('authors')
    }catch{
        res.render('authors/new', {
            author: author, // we send it even tho there was error creating new author because authors/new is rendering and name of this author object will fill the input bar so that user know what was his last submit
            errorMessage: 'Error creating Author'
         }); 
    }

})


module.exports = router