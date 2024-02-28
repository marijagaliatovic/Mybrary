//if process is not in production, not deployed
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config() //loading .env file to process.env from where we can access KEY and VALUE pairs
}

const express = require('express')
const app = express() //inicialization of express application
const expressLayouts = require('express-ejs-layouts') //embedded js, express-ejs-layouts imported as expressLayouts  
const bodyParser = require('body-parser') //enabels parsing of request body, it extracts the data and converts it to the format that is usable in express app
const methodOverride = require('method-override')

const indexRouter = require('./routes/index') //import of controller/route definded in /routes/index
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

app.set('view engine', 'ejs') //setting view engine to EJS, Express will automatically look for ejs files in "views" folder and render them as views
app.set('views', __dirname + '/views') //views are located in the same directory as express file but in views directory
app.set('layout', 'layouts/layout') //each EJS view rendered by your application will be wrapped in the layout specified by this setting, path to layout
app.use(expressLayouts) //this ensures use of layout in every view
app.use(methodOverride('_method')) //_method is the parametar that we have to include
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit:'20mb', extended:false})) //body parser is used for parsing URL-encoded from incoming requests, max size of request is 20mb , extended:false -> data is represented as plain object


const mongoose = require('mongoose')
  
mongoose.connect(process.env.DATABASE_URL) //connecting to mongoDB using URL saved in DATABASE_URL

const db = mongoose.connection // fetching reference to connection object with database
db.on('error', error => console.error(error))//first argument is name of event, the second is eventlistener, on error it will consol.errorthe error
db.once('open', ()=> console.log('Connected to Mongoose')) // open is event, when connection is established connected to Mongooose will bi consol.log-ed

app.use('/', indexRouter) //use the index router for incoming requests that match the "/" path
app.use('/authors', authorRouter) //use the author router for incoming requests that match the "/authors" path
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000)
