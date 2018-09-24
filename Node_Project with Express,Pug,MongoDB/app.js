//Modules to be included
const express = require('express');
const path = require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const expressValidator=require('express-validator');
const flash=require('connect-flash');
const session=require('express-session');
const config=require('./config/database');
const passport=require('passport');

//Mongoose connect to MONGODB
mongoose.connect(config.database);    //nodeproject1 is he name of the databse we created in MONGODB
let db=mongoose.connection;

//check connection
db.once('open',()=>{
  console.log("Connected to MongoDB");
});

//check for db errors
db.on('error',(err)=>{
  console.log(err);
});

//App Init
const app=express();

//bringing in our models
let Article=require('./models/article');

//View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Bodyparser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Set public folder as static
app.use(express.static(path.join(__dirname,'public')));

//Express middlewares
//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
//express-validator middleware
app.use(expressValidator({
  errorFormatter:function(param,msg,value){
    var namespace = param.split('.')
    , root=namespace.shift()
    , formParam=root;

    while (namespace.length) {
      formParam+='[' + namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

//Passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
  res.locals.user=req.user || null;
  next();
})

//Home Route
app.get('/',(req,res)=>{

    Article.find({},(err,articles)=>{
      if(err){
        console.log("Error in MongoDB");
      }
      else{
      res.render('index',{
        heading1:'Articles:-',      /*in this way v can send the variable named heading1 to the index view and use it over there by #{heading1}*/
        articles: articles          //sending the articles array as articles
      });
    }
    });
  /*let articles=[
    {
      id:1,
      title:'Article One',
      author:'Hikansh',
      body:'this is article 1'
    },
    {
      id:2,
      title:'Article Two',
      author:'Hikansh',
      body:'this is article 2'
    },
    {
      id:3,
      title:'Article Three',
      author:'Hikansh',
      body:'this is article 3'
    }
  ]*/

});

//Route files
let articles=require('./routes/articles');
let users=require('./routes/users');

app.use('/articles',articles);    //this means anything that goes to /articles then it will go to the routes/articles file
app.use('/users',users);

//starting the server
app.listen(3000,()=>{
  console.log('server started at port 3000');
});
