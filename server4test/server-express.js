const express = require('express');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
fs = require('fs');
path = require('path');
const util = require('util');
const app = express();
let sizeOf = require('image-size');

// logging purpose
let log_filename_tag = `[${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')} ${path.basename(__filename)}]`;

/*** Path configuration *********************************************************/
// public: path for json and images.
const outPathJson = 'server4test/out/';
const outPathFile = outPathJson;
// public path for html
const htmlPathDefault = 'output/'; // Last version!
const mapHtmlVersionPath = new Map();
mapHtmlVersionPath.set('0', 'output_old/');
mapHtmlVersionPath.set('17', htmlPathDefault); // Add new to this map!!!
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

// Static folders
app.use(express.static(htmlPathDefault));
app.use(express.static(outPathJson));

// Check paths
app.use(function (req, res, next) {
  console.log(`${log_filename_tag} [check path]`);
  /* check for valid path, if fail throw errorHandler! */
  if (fs.accessSync(outPathJson, fs.constants.W_OK) === false) {
    throw new Error(util.format('Path: %s does not exist!', outPathJson));
  }
  /* check for valid path, if fail throw errorHandler! */
  if (fs.accessSync(outPathFile, fs.constants.W_OK) === false) {
    throw new Error(util.format('Path: %s does not exist!', outPathFile));
  }
  next();
});


app.post('/resource', (req, res) => {
  if (req.is('application/json')) {
    console.log(`${log_filename_tag} [resource]`);

    // save json on out.
    let filepath = outPathJson + req.body.uuid + '.json';
    let filecontent = JSON.stringify(req.body, null, 2);
    fs.writeFile(filepath, filecontent, 'utf8', (err) => {
      if (err) {
        console.error(`${log_filename_tag} ${err}`);
      } else {
        console.log(`${log_filename_tag} json file ${filepath} SAVED!`);
      }
    });

    res.json(req.body);
  }
});

app.post('/upload', (req, res, next) => {

  console.log(`${log_filename_tag} [upload]`);

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
        console.log(`${log_filename_tag} binary file ${filepath} SAVED!`);
      }
    });
    next();
  });

  res.json('{"result":"success"}');

});

app.get('/download', (req, res) => {

  var p = req.query;
  var html = '<html><body style="font-family: sans-serif; text-align: center;"><script> ';

  for (var key in p) {

     html += 'var a = document.createElement("a"); ' +
             'a.href = "' + p[key] + '";' +
             'a.setAttribute("download", "' + key + '.jpg"); ' +
             'document.body.appendChild(a); ' +
             'a.click(); ';
  }
  html += '</script><h3>';
  html += 'Confermare download multiplo se richiesto dal browser<br><br>'
  html += '<a href="javascript:history.back()">Torna al dettaglio</a>';
  html += '<h3></body></html>';
  res.send(html);

});

app.get('/card', (req, res) => {

  console.log(`${log_filename_tag} [card]`);

  res.setHeader('Content-Type', 'text/html');

  let rawdata = fs.readFileSync(outPathJson.concat(req.query.uuid).concat('.json'));
  let uuidObj = JSON.parse(rawdata);

  // The HTML file can come from previous version.
  let htmlPath = mapHtmlVersionPath.get(uuidObj.version);
  if (htmlPath === undefined) { 
    // JSON file without VERSION attribute belonged to the first deploy!
    htmlPath = mapHtmlVersionPath.get("0")
  }
  
  console.log(`${log_filename_tag} [card] request version: ${uuidObj.version} - path: ${htmlPath}`);

  JSDOM.fromFile(htmlPath.concat(uuidObj.filename))
    .then((dom) => {
      let doc = dom.window.document;

      /* Files used to add extra notes */
      // html
      let cardMenu = fs.readFileSync(htmlPathDefault.concat('card.menu.html'));
      doc.body.insertAdjacentHTML("afterbegin", cardMenu);
      // javascript
      doc.getElementById('inpage').insertAdjacentHTML("beforebegin", '<script type="text/javascript" src="card.menu.js"></script>\n');
      doc.getElementById('inpage').insertAdjacentHTML("beforebegin", '<script type="text/javascript" src="card.js"></script>\n');

      // disable menù!
      doc.getElementById('buttonToggle').setAttribute('style', 'display: none;');

      // set uuid
      doc.getElementById('uuid').setAttribute('value', uuidObj.uuid);

      try { 
        // Declares the page came from card request.
        doc.getElementById('pageFrom').setAttribute('value', 'card');
      } catch (e) {
        console.error(`${log_filename_tag} [card] An old document, attribute pageFrom does not exist!`);
      }

      /* Editable cards management ********************/
      // Background color LightGreen for editable fields in card mode!
      let disableChangeNote = true;
      let editableElements = doc.getElementsByTagName('form')[0].querySelectorAll('textarea, input, select, checkbox');
      editableElements.forEach( ede => {
        if (ede.getAttribute('editcard') === "true"){
          ede.parentNode.style.background = "LightGreen";
          disableChangeNote = false;
        } else {
          ede.disabled = true;
        }
      })
      // Disable the "ChangeNote" button with no editable fields.
      if (disableChangeNote) { doc.getElementById("changeNote").setAttribute('style', 'display: none;'); }
      /* Editable cards management ********************/

      // Values from JSON to HTML
      uuidObj.content.forEach(objContent => {

        switch (objContent.type) {
          case 'text':
            if (doc.getElementById(objContent.id)) {
              doc.getElementById(objContent.id).setAttribute('value', objContent.value);
            } else {
              // workaround: id in json match 2 or more elements in html, set all!
              // example: dg_codice_cabina match dg_codice_cabina__parma and dg_codice_cabina__torino_chiomonte
              let arr = doc.querySelectorAll('[id^="'.concat(objContent.id).concat('"]'));
              for (let i = 0; i < arr.length; i++) {
                doc.getElementById(arr[i].id).setAttribute('value', objContent.value);
              }
            }
            break;
          case 'date':
            doc.getElementById(objContent.id).setAttribute('value', objContent.value);
            break;
          case 'textarea':
            doc.getElementById(objContent.id).textContent = objContent.value;
            break;
          case 'select-one':
            
            if (objContent.selectedIndex === undefined){
              // Workaround: The old version of JSON doesn't contain the "selectedIndex" attribute.
              let ops = doc.getElementById(objContent.id).options;
              for (let i = 0; i < ops.length; i++) {
                if (objContent.value === ops[i].value) {
                  ops[i].setAttribute('selected', '');
                }
              }
            } else {
              let ops = doc.getElementById(objContent.id).options;
              let elemToAdd = objContent.selectedIndex - (ops.length - 1);
              for (let i = 1; i <= elemToAdd; i++) {
                /* 
                * In the current HTML doc, default options are less than the specific index. 
                * This situation can happen using "ruleValue" in the Json configuration.
                */
                // console.log("---->" + objContent.id + " " + elemToAdd)
                ops.add(doc.createElement("option"));
              }
              ops[objContent.selectedIndex].setAttribute('selected', '');
           }


            break;
          case 'checkbox':
            if (objContent.value === 'true') {
              doc.getElementById(objContent.id).setAttribute('checked', '');
            }
            break;
          case 'radio':
            let names = doc.getElementsByName(objContent.id);
            for (let i = 0; i < names.length; i++) {
              const el = names[i];
              if (objContent.value === el.value) {
                el.setAttribute('checked', '');
              }
            }
            break;
          case 'file':
            addImage(dom, objContent.id, objContent.value);
            break;
          default:
            console.log(`${log_filename_tag} [card] ${objContent.type} TODO!`);
            break;
        }

      });

      res.send(dom.serialize());

    })
    .catch((err) => {
      console.log(err);
    });

});

const addImage = (dom, id, filename) => {

  const imgId = id + '_img';

  let doc = dom.window.document;
  let dimensions = sizeOf(outPathJson.concat(filename));

  let f = doc.getElementById(id);
  let c = f.closest('div');
  let ul = doc.createElement('img');
  let iconSize = 42;
  ul.setAttribute('id', imgId);
  ul.setAttribute('src', filename);
  ul.setAttribute('height', iconSize);
  ul.setAttribute('width', iconSize);
  ul.setAttribute('style', 'border: 1px solid red; border-radius: 10%; cursor: pointer;');
  ul.setAttribute('title', 'Clicca per ingrandire!');
  ul.setAttribute('onclick', `card.imageClick(this,${dimensions.height},${dimensions.width},${iconSize})`);
  c.appendChild(ul);
}

/**
 * It receives the entire JSON from mode Card, 
 * searches in the relative HTML file for elements with attributes "Editcard", 
 * and changes them in output JSON file.
 */
app.post('/resourceFromCard', (req, res) => {

  console.log(`${log_filename_tag} [resourceFromCard]`);
  // console.log(req.body)

  let originalPath = outPathJson.concat(req.body.uuid).concat('.json');

  JSDOM.fromFile(htmlPathDefault.concat(req.body.filename)).then((dom) => {
    // relative HTML file.
    let doc = dom.window.document;

    // JSON previously saved.
    let rawdata = fs.readFileSync(originalPath);
    let jsonPrevSaved = JSON.parse(rawdata);

    // Filter for elements to change!
    let elementToChange = req.body.content.filter(el => {
      let elFromHtml = doc.getElementById(el.id);
      return elFromHtml.getAttribute("editcard") === "true";
    });

    // Delete all editable elements from the original json file.
    let jsonPrevSavedNewContent = jsonPrevSaved.content.filter(elPrevSaved => {
      return elementToChange.find(elToChange => elToChange.id === elPrevSaved.id) === undefined;
    });

    // Inserts all the new editable elements into the original JSON file.
    jsonPrevSaved.content = jsonPrevSavedNewContent;
    jsonPrevSaved.content.push(...elementToChange);

    // It changes attribute pageFrom
    jsonPrevSaved.pageFrom = req.body.pageFrom;

    // Print out result
    let newPath = originalPath.concat('.').concat(new Date().getTime());
    fs.renameSync(originalPath, newPath); // Do a backup of the current file.
    fs.writeFileSync(originalPath, JSON.stringify(jsonPrevSaved, null, 2)); // Modify file
   
  });

  res.json(req.body);
  
});


function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500);
  res.render('error', { error: err });
}


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`${log_filename_tag} Server listening on port ${PORT}`);
});


