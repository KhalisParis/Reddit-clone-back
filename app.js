var express = require('express');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

var path = require('path');

app.set('view engine', 'ejs'); 
const bcrypt = require('bcrypt');

const cors = require('cors');
app.use(cors());

const User = require('./models/User');

const {createToken, validateToken} = require('./JWT');

const Post = require('./models/Post');

const Comment = require('./models/Comment');

const cookieParser = require('cookie-parser');
app.use(cookieParser());


const methodOverride = require('method-override');
app.use(methodOverride('_method'))

const multer = require('multer');

app.use(express.static('public'));

require('dotenv').config()

var mongoose = require('mongoose');
const { log } = require('console');


var dbURL = process.env.DATABASE_URL
mongoose.set('strictQuery', false)

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("MongoDB connected !"))
.catch(err => console.log("Error : "+ err));

app.post('/api/signup', function(req, res){
  console.log(req.body);
  const Data = new User({
      username : req.body.username,
      email : req.body.email,
      password : bcrypt.hashSync(req.body.password, 10),
      admin : false,
  })

      Data.save().then(() =>{
          console.log("Data saved successfully");
          res.redirect('http://localhost:3000/connexion');
      }).catch(err => { console.log(err) });
  })
      
app.get('/signup', function(req, res){ 
  res.render('Signup');
})

//Login
app.post('/api/signin', function(req, res){
  User.findOne({
      email: req.body.email
  }).then(user => {
      if(!user) {
          return res.status(404).send('Email Invalid !');
      }

      const accessToken = createToken(user);

      res.cookie("access-token" ,accessToken, {maxAge: 60*60*24*30*12, httpOnly:true} )

      if(!bcrypt.compareSync(req.body.password, user.password)) 
      {
          return res.status(404).send('Password Invalid!');
      }
      // res.redirect('http://localhost:3000/');
      res.json(res.redirect('http://localhost:3000/user'));
  }).catch(err => {console.log(err)})
  })


app.get('/login', function(req,res){
  res.render('Signin');
});


app.post('/new-post', validateToken, function(req, res) {
  const Data = new Post({
    titre: req.body.titre,
    medias: req.body.medias,
    description: req.body.desc
  });
  Data.save()
    .then(() => res.redirect('http://localhost:3000/user'))
    .catch(err => console.log(err));
});

app.get('/allposts', function(req, res){
  // const accessToken = 
  // console.log(req.cookies);

  Post.find().then(data => {
      // res.render('AllPost', {data: data})
      res.json({data: data});
      
  }).catch(err => console.log(err));
});

const storage = multer.diskStorage({
  destination:(req, file, callback) => {
    callback(null, 'public')
  },
  filename:(req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  },
}) 

const upload = multer({storage}).single('file');

app.post('/upload', function(req, res) {
  upload(req, res, err => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    const Data = new Post({
      titre: req.body.titre,
      medias: req.file.filename,
      description: req.body.desc
    });
    Data.save()
      .then(() => res.redirect('http://localhost:3000/user'))
      .catch(err => console.log(err));
  });
});

app.get('/allposts/:id', function(req, res){
  Post.findOne(
      {
          _id: req.params.id
      }).then(data => {
          res.json({data: data});
      }).catch(err => { console.log(err) });
});

app.delete('/allposts/delete/:id', function(req, res){
  Post.findOneAndDelete({
      _id: req.params.id
  }).then(data => {
      console.log("data deleted");
      res.redirect('/allposts');
  }).catch(err => { console.log(err) });
});

app.post('/new-comment',validateToken, function(req,res){
  const Data = new Comment({
      comment : req.body.comment,
  });
  Data.save().then(() => 
  res.json(res.redirect('http://localhost:3000/user')) 
  )
      .catch(err => console.log(err));
      console.log(req.body.comment);

}); 
app.get('/allcomment', function(req, res) {
  Comment.find().then(data => {
    res.json({ comments: data });
  }).catch(err => console.log(err));
});
  

  var server = app.listen(5000, function(){
    console.log("NodeJS listening on port 5000");
})