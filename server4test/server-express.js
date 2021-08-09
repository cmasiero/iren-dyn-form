const express = require('express');
fs = require('fs');
const util = require('util');


const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods': 'OPTIONS, POST, GET'");
  res.header("Access-Control-Max-Age': 2592000"); // 30 days
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.post('/resource', (req, res) => {
  if (req.is('application/json')) {
    console.log("[server-express] ");

    // save json on out.
    let filepath = 'server4test/out/' + req.body.uuid + '.json';
    let filecontent = JSON.stringify(req.body, null, 2);
    fs.writeFile(filepath, filecontent, 'utf8', (err) => {
      console.log(util.format('[server-express] file %s SAVED!', filepath));
    });

    res.json(req.body);
  }

});

app.post('/upload', (req, res, next) => {

  // var data = new Buffer('');
  let data = new Buffer.from('', "binary");
  req.on('data', function(chunk) {
      data = Buffer.concat([data, chunk]);
  });
  req.on('end', function() {
    req.rawBody = data;
    fs.writeFile("server4test/out/" + req.query.filename, data,  "binary",function(err) { 
      console.error(err);
    });
    next();
  });

  res.json('{"result":"success"}');

});




const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});
