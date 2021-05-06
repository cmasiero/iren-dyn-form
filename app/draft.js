'use strict';

// import iconv from 'iconv-lite';
// import encodings from 'iconv-lite/encodings';
// iconv.encodings = encodings;

const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let fileJson = fs.readFileSync('config/file01.json');
let jsonObj = JSON.parse(fileJson);

let keyNames = Object.keys(jsonObj);
// console.log(keyNames);
//console.log(JSON.stringify(jsonObj, null, 2));
// keyNames.forEach(element => {
//     console.log(jsonObj[element]);
// });



const html = fs.readFileSync( 'template/version5.html' ).toString();

// HTML to be imported as DOM
// const html = './app/donation-types.html';
var dom = new JSDOM( html );

// set the global window and document objects using JSDOM
// global is a node.js global object
if ( global !== undefined ) {
  global.window = dom.window;
  global.document = dom.window.document;
}


//console.log(dom.window.document.querySelector("title").textContent);

const bodyElements = dom.window.document.getElementsByTagName("body");
const bodyElement = bodyElements[0];
bodyElement.insertAdjacentHTML("afterbegin", "<div>Goodbye!!</div>");
console.log(`DOM AFTER INSERT: ${dom.serialize()}`); 