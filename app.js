const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
//new way of connecting database via config files
const config = require('./config/database');
const passport = require('passport');
var admin = require("firebase-admin");
// const { check, validationResult } = require('express-validator');
// const {check, validationResult} = require('express-validator/check');



// mongoose.connect('mongodb://localhost/nodekb', { useNewUrlParser: true });
mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

//check db connection

db.once('open', function(){
  console.log('Connected to MongoDb');
});
//check for db errors
db.on('error', function (err){
  console.log(err);
});

//init app
const app = express();
//to bring in models
let Article = require('./models/article');

//load view engine. THIS LOADS THE VIEW FOLDE TO SEE ALL PU VIEW PUG PAGES
//WHILE THE SECOND LOADS OUR VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder to give access to public folder files
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
       root    = namespace.shift();
       formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


//bring in passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
 app.use(passport.session());

 //enable global variable
 app.get('*', function (req, res, next) {
   res.locals.user = req.user || null;
   next();
 });

//home route
app.get('/', function(req, res){

Article.find({}, function(err, articles){
if (err) {
  console.log('err');
}else {
  res.render('index', {
            title:'articles',
            articles: articles
  });
}

});
});

//to route all files back to articles
let articles = require('./routes/articles');
app.use('/articles', articles);
let users = require('./routes/users');
app.use('/users', users);
//start server
app.listen(4000, function(){
  console.log('server started on ths port 4000...');
});
