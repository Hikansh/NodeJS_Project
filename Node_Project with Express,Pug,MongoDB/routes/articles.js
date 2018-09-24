const express = require('express');
const router = express.Router();

//bringing in our models
let Article=require('../models/article');
let User=require('../models/user');

//Add Article Route
router.get('/add',ensureAuthenticated,(req,res)=>{
  res.render('add_article',{
    heading1:'Add Articles Here..!'
  });
});

//Add submit POST Route
router.post('/add',(req,res)=>{
  let article=new Article();
  article.title=req.body.title;
  article.author=req.user._id;
  article.body=req.body.body;
  article.save(()=>{
      req.flash('success','Article Added');
      res.redirect('/');
  });
});

//Edit/Update submit POST Route
router.post('/edit/:id',(req,res)=>{
  let article={};
  article.title=req.body.title;
  article.author=req.body.author;
  article.body=req.body.body;
  let query={_id:req.params.id};
  Article.update(query,article,()=>{
      req.flash('success','Article Updated');
      res.redirect('/');
  });
});

//Delete route
router.delete('/:id',(req,res)=>{
  if (!req.user._id) {
    res.status(500).send();
  }

  let query={_id:req.params.id};

  Article.findById(req.params.id,(err,article)=>{
    if (article.author!=req.user._id) {
      res.status(500).send();
    }
    else{
      Article.remove(query,(err)=>{
        if(err)
        console.log(err);
        res.send('Success');
      });
    }
  });
});

//view article route
router.get('/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    User.findById(article.author,(err,user)=>{
      let usern=user.name;
      console.log(usern);
      res.render('article',{
        article:article,
        author:usern
    });
    });
  });
});

//Edit route
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    if(article.author!=req.user._id){
      req.flash('danger','Not Authorized..!');
      res.redirect('/');
    }
    res.render('edit_article',{
      title:'Edit Article:-',
      article:article
    });
  });
});

//Access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('danger','Please Login to Add/Edit Articles');
    res.redirect('/users/login')
  }
}


module.exports= router;
