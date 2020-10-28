const express = require('express');
const router = express.Router();


//to bring in Article models
let Article = require('../models/article');
//to bring in User models
let User = require('../models/user');

//add route
router.get('/add', ensureAuthenticated, function(req, res){

  res.render('add_article', {
            title:'Add Articles'
  });

});

//add post route for articles add_article
router.post('/add', function(req, res){

  req.checkBody('title', 'Title Required').notEmpty();
  // req.checkBody('author', 'Author Required').notEmpty();
  req.checkBody('body', 'Body Required').notEmpty();
  // check('title', 'Title Required').not().isEmpty();
  // check('author', 'Author Required').not().isEmpty();
  // check('body', 'Body Required').not().isEmpty();
//To Get errors
let errors = req.validationErrors();

if (errors) {
  res.render('add_article', {
    title:'Add Articles',
    errors:errors
  });
} else {

  let article = new Article();
 article.title = req.body.title;
 article.author = req.user._id;
 article.body = req.body.body;
 // console.log(req.body);
 article.save(function(err){
   if (err) {
       console.log(err);
       return;
             }else {
               req.flash('success', 'Article Added Succesfully');
               res.redirect('/');
                 }
               });
          }


 });

 //load edit form
 router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
      console.log('if condition dey work');
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });
});

 //Update articles for articles add_article
 router.post('/edit/:id', function(req, res){
  let article = {};

 article.title = req.body.title;
 article.author = req.body.author;
 article.body = req.body.body;
 let query = {_id:req.params.id};
 // console.log(req.body);
 Article.update(query, article, function(err){
   if (err) {
       console.log(err);
       return;
             }else {
                req.flash('success', 'Article Updated Succesfully');
               res.redirect('/');
                 }
               });
  });


//delete articles
router.delete('/:id', function(req, res){

// check if user is logged in
if(!req.user._id){
  res.status(500).send();
}
  let query = {_id:req.params.id}
//to check if its the user that wrote the articles
Article.findById(req.params.id, function (err, article) {
  if (article.author != req.user._id) {
    res.status(500).send();
  }else {

    Article.remove(query, function(err){
      if(err){
        console.log(err);
      }
      res.send('Success');
    });

  }
});

});
//add single id route
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    // console.log(article);
    // return;
    User.findById(article.author, function(err, user){
      res.render('article', {
                article:article,
                author: user.name
      });
    });

  });
});

//give access to users to add articles
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please Log In First');
    res.redirect('/users/login');
  }
}
module.exports = router;
