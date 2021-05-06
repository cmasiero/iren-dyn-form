"use strict"
//const exampleModule = require('../module/example/example-module');
const {ExampleClass} = require('../module/example/example-module');

//let m = new exampleModule.ExampleClass("ExampleClass param value!");
let ec = new ExampleClass("ExampleClass param value!");
ec.show();

//console.log("-> " + JSON.stringify(exampleModule));


const exampleFunction = (a, b) => {
  return a + b;
};

exports.exampleFunction = exampleFunction;