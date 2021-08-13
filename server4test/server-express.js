const express = require('express');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
fs = require('fs');
const util = require('util');
const app = express();
var sizeOf = require('image-size');


/*** Path configuration *********************************************************/
const outPathJson = 'server4test/out/';
const outPathFile = outPathJson;
const htmlPath = 'output/';
/********************************************************************************/

/* CORS options ***/
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods': 'OPTIONS, POST, GET'");
  res.header("Access-Control-Max-Age': 2592000"); // 30 days
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(errorHandler);

// public: path for json and images.
app.use(express.static(htmlPath));
app.use(express.static(outPathJson));

app.post('/resource', (req, res) => {
  if (req.is('application/json')) {
    console.log("[server-express] resource");

    /* check for valid path, if fail throw errorHandler! */
    let pathFileCheck = outPathJson + 'check'.concat(new Date().getTime()).concat('.txt');
    try {
      fs.writeFileSync(pathFileCheck, 'ck');
    } catch (err) {
      throw new Error(util.format('Path: %s does not exist!', outPathJson));
    }

    // save json on out.
    let filepath = outPathJson + req.body.uuid + '.json';
    let filecontent = JSON.stringify(req.body, null, 2);
    fs.writeFile(filepath, filecontent, 'utf8', (err) => {
      if (err) {
        console.error(err);
      } else {
        // console.log(util.format('[server-express] json file %s SAVED!', filepath));
        console.log('[server-express] json file %s SAVED!', filepath);
      }
    });

    /* delete check */
    fs.unlink(pathFileCheck, function (err) {
      if (err) throw err;
      console.log('File check %s deleted!', pathFileCheck);
    });

    res.json(req.body);
  }

});

app.post('/upload', (req, res, next) => {

  console.log("[server-express] upload");

  /* check for valid path, if fail throw errorHandler! */
  let pathFileCheck = outPathFile + 'check'.concat(new Date().getTime()).concat('.txt');
  try {
    fs.writeFileSync(pathFileCheck, 'ck');
  } catch (err) {
    throw new Error(util.format('Path: %s does not exist!', outPathFile));
  }


  let data = new Buffer.from('', "binary");
  req.on('data', function (chunk) {
    data = Buffer.concat([data, chunk]);
  });
  req.on('end', function () {
    req.rawBody = data;
    let filepath = outPathFile + req.query.filename;
    fs.writeFile(filepath, data, "binary", (err) => {
      if (err) {
        console.error(err);
      } else {
        // console.log(util.format('[server-express] binary file %s SAVED!', filepath));
        console.log('[server-express] binary file %s SAVED!', filepath);
      }
    });
    next();
  });

  /* delete check */
  fs.unlink(pathFileCheck, function (err) {
    if (err) throw err;
    console.log('File check %s deleted!', pathFileCheck);
  });

  res.json('{"result":"success"}');

});


app.get('/card', (req, res) => {

  res.setHeader('Content-Type', 'text/html');

  let rawdata = fs.readFileSync(outPathJson.concat(req.query.uuid).concat('.json'));
  let uuidObj = JSON.parse(rawdata);
  // console.log(uuidObj);

  JSDOM.fromFile(htmlPath.concat(uuidObj.filename))
    .then((dom) => {

      let doc = dom.window.document;
      uuidObj.content.forEach(objContent => {
        console.log(objContent);
        if (objContent.type === 'text') {
          doc.getElementById(objContent.id).setAttribute('value', objContent.value);
        } else if (objContent.type === 'file') {
          addImage(dom, objContent.id, objContent.value);
        }
      });

      res.send(doc.documentElement.outerHTML);

    })
    .catch((err) => {
      console.log(err);
    });

});

const addImage = (dom, id, filename) => {

  let doc = dom.window.document;

  let dimensions = sizeOf(outPathJson.concat(filename));
  console.log(dimensions.width, dimensions.height);

  let f = doc.getElementById(id);
  let c = f.closest('div');
  let ul = doc.createElement('img');
  let iconSize = 42;
  ul.setAttribute('id', 'image_id');
  ul.setAttribute('src', filename);
  ul.setAttribute('height', iconSize);
  ul.setAttribute('width', iconSize);
  ul.setAttribute('style', 'border: 1px solid red; border-radius: 10%; cursor: pointer;');
  ul.setAttribute('title', 'Clicca per ingrandire!');
  ul.setAttribute('onclick', `
                            this.toggle = !this.toggle;
                            if (toggle){ this.height = ${dimensions.height}; this.width = ${dimensions.width}; this.title = 'Clicca per iconizzare!' }
                            else {this.height = ${iconSize}; this.width = ${iconSize}; this.title = 'Clicca per ingrandire!'}
                            `

  );
  c.appendChild(ul)
}


function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500);
  res.render('error', { error: err });
}


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});


