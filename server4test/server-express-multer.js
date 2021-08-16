var express = require('express');
var multer  = require('multer');
var upload = multer({ dest: 'server4test/out/' });

var app = express()
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods': 'OPTIONS, POST, GET'");
  res.header("Access-Control-Max-Age': 2592000"); // 30 days
  next();
});


app.post('/resource', upload.single('myFile'), function (req, res, next) {
  // console.log(req.file);
  console.log(req.myFile);
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});


